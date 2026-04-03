import { NextRequest, NextResponse } from "next/server";
import { existsSync } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";
import { join } from "path";
import { findUserById, updateUserById } from "@/lib/userStore";
import { invalidateCachedProfile, setCachedProfile } from "@/lib/profileCache";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);
const FALLBACK_MIME_TYPES = new Set(["", "application/octet-stream"]);

function sanitizeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function getFileExtension(fileName: string) {
  const index = fileName.lastIndexOf(".");
  if (index < 0) {
    return "";
  }
  return fileName.slice(index).toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const userId = String(formData.get("userId") || "").trim();
    const image = formData.get("image");

    if (!userId) {
      return NextResponse.json(
        { error: "User id is required" },
        { status: 400 },
      );
    }

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "Profile image file is required" },
        { status: 400 },
      );
    }

    const extension = getFileExtension(image.name);
    const mimeType = String(image.type || "").toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        { error: "Only PNG, JPG, JPEG, WEBP, or GIF files are allowed" },
        { status: 400 },
      );
    }

    if (
      !ALLOWED_MIME_TYPES.has(mimeType) &&
      !FALLBACK_MIME_TYPES.has(mimeType)
    ) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 },
      );
    }

    if (image.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Profile image size should be less than 3MB" },
        { status: 400 },
      );
    }

    const user = await findUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const safeUserId = sanitizeSegment(userId);
    const baseUploadDir = join(
      process.cwd(),
      "public",
      "uploads",
      "profile-images",
    );
    const userUploadDir = join(baseUploadDir, safeUserId);

    if (!existsSync(baseUploadDir)) {
      await mkdir(baseUploadDir, { recursive: true });
    }

    if (!existsSync(userUploadDir)) {
      await mkdir(userUploadDir, { recursive: true });
    }

    if (
      user.profileImageUrl &&
      user.profileImageUrl.startsWith("/uploads/profile-images/")
    ) {
      const existingFilePath = join(
        process.cwd(),
        "public",
        user.profileImageUrl.replace(/^\//, ""),
      );

      if (existsSync(existingFilePath)) {
        await unlink(existingFilePath).catch(() => {
          // Non-fatal cleanup failure.
        });
      }
    }

    const timestamp = Date.now();
    const safeFileName = sanitizeFileName(image.name);
    const storedFileName = `${timestamp}_${safeFileName}`;
    const filePath = join(userUploadDir, storedFileName);

    const fileBytes = await image.arrayBuffer();
    await writeFile(filePath, Buffer.from(fileBytes));

    const profileImageUrl = `/uploads/profile-images/${safeUserId}/${storedFileName}`;
    const updatedUser = await updateUserById(userId, {
      profileImageUrl,
      profileImageUpdatedAt: new Date().toISOString(),
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { password, ...safeUser } = updatedUser;
    invalidateCachedProfile(`profile:${userId}`);
    setCachedProfile(`profile:${userId}`, safeUser, 60_000);

    return NextResponse.json(
      {
        user: safeUser,
        profileImageUrl,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (error) {
    console.error("Profile image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload profile image" },
      { status: 500 },
    );
  }
}
