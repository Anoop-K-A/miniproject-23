import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import { findUserById, updateUserById } from "@/lib/userStore";
import { isPrimaryAdminEmail } from "@/lib/adminConfig";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function GET(request: NextRequest) {
  try {
    const userId = String(
      request.nextUrl.searchParams.get("userId") || "",
    ).trim();
    if (!userId) {
      return NextResponse.json(
        { error: "User id is required" },
        { status: 400 },
      );
    }

    const user = await findUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { password, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      userId?: string;
      email?: string;
      phone?: string;
      experience?: string;
    };

    const userId = String(body.userId || "").trim();
    if (!userId) {
      return NextResponse.json(
        { error: "User id is required" },
        { status: 400 },
      );
    }

    const user = await findUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isAdminUser =
      user.role === "admin" ||
      (Array.isArray(user.roles) && user.roles.includes("admin"));

    if (isAdminUser) {
      return NextResponse.json(
        { error: "Admin profile supports password update only" },
        { status: 403 },
      );
    }

    const normalizedEmail = normalizeEmail(String(body.email || ""));
    if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "A valid email is required" },
        { status: 400 },
      );
    }

    const currentEmail = normalizeEmail(String(user.email || ""));
    const emailChanged = normalizedEmail !== currentEmail;

    if (
      emailChanged &&
      isPrimaryAdminEmail(user.email || user.username || "")
    ) {
      return NextResponse.json(
        { error: "Primary admin email cannot be modified" },
        { status: 403 },
      );
    }

    if (emailChanged && user.firebaseUid) {
      try {
        await adminAuth.updateUser(user.firebaseUid, {
          email: normalizedEmail,
        });
      } catch (error) {
        const firebaseError = error as { code?: string };
        if (firebaseError.code === "auth/email-already-exists") {
          return NextResponse.json(
            { error: "Email is already in use" },
            { status: 400 },
          );
        }

        console.error("Failed to sync Firebase email update:", error);
        return NextResponse.json(
          {
            error:
              "Failed to sync email with authentication service. Please try again.",
          },
          { status: 502 },
        );
      }
    }

    const updatedUser = await updateUserById(userId, {
      email: normalizedEmail,
      phone: String(body.phone || "").trim(),
      experience: String(body.experience || "").trim(),
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { password, ...safeUser } = updatedUser;
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "PRIMARY_ADMIN_LOCKED" ||
        error.message === "PRIMARY_ADMIN_IDENTITY_RESERVED"
      ) {
        return NextResponse.json(
          { error: "Primary admin profile cannot be modified" },
          { status: 403 },
        );
      }

      if (error.message === "DUPLICATE_USER") {
        return NextResponse.json(
          { error: "Email is already in use" },
          { status: 400 },
        );
      }
    }

    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
