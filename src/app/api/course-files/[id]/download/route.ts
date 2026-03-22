import { NextResponse } from "next/server";
import fs from "fs/promises";
import { createReadStream } from "fs";
import path from "path";
import { Readable } from "stream";
import { readJsonFile } from "@/lib/jsonDb";
import type { CourseFile } from "@/components/CourseFileManager/types";

export const runtime = "nodejs";

const mimeTypes: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".txt": "text/plain",
};

function sanitizeDownloadName(name: string) {
  const cleaned = name.trim().replace(/[\\/:*?"<>|]+/g, "-");
  return cleaned || "course-file";
}

function getContentType(
  fileName: string,
  fallback = "application/octet-stream",
) {
  const ext = path.extname(fileName).toLowerCase();
  return mimeTypes[ext] ?? fallback;
}

function buildDownloadHeaders(fileName: string, contentType: string) {
  const safeFileName = sanitizeDownloadName(fileName);
  const encodedFileName = encodeURIComponent(safeFileName);

  return {
    "Content-Type": contentType,
    "Content-Disposition": `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodedFileName}`,
    "Cache-Control": "private, max-age=300, stale-while-revalidate=600",
  };
}

function buildStreamHeaders(
  fileName: string,
  contentType: string,
  contentLength: number,
) {
  return {
    ...buildDownloadHeaders(fileName, contentType),
    "Content-Length": String(contentLength),
  };
}

function parseDataUrl(dataUrl: string) {
  const base64Match = dataUrl.match(/^data:([^;,]+);base64,(.+)$/);
  if (base64Match) {
    return {
      contentType: base64Match[1],
      data: Buffer.from(base64Match[2], "base64"),
    };
  }

  const plainMatch = dataUrl.match(/^data:([^;,]+),(.*)$/);
  if (plainMatch) {
    return {
      contentType: plainMatch[1],
      data: Buffer.from(decodeURIComponent(plainMatch[2]), "utf-8"),
    };
  }

  return null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const files = await readJsonFile<CourseFile[]>("courseFiles.json");
    const file = files.find((entry) => entry.id === id);

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (!file.documentUrl) {
      return NextResponse.json(
        { error: "No document is available for this file" },
        { status: 404 },
      );
    }

    if (file.documentUrl.startsWith("data:")) {
      const parsed = parseDataUrl(file.documentUrl);
      if (!parsed) {
        return NextResponse.json(
          { error: "Invalid stored document format" },
          { status: 400 },
        );
      }

      return new NextResponse(new Uint8Array(parsed.data), {
        headers: buildDownloadHeaders(
          file.fileName,
          getContentType(file.fileName, parsed.contentType),
        ),
      });
    }

    if (!file.documentUrl.startsWith("/uploads/")) {
      return NextResponse.json(
        { error: "Unsupported document location" },
        { status: 400 },
      );
    }

    const publicRoot = path.resolve(process.cwd(), "public");
    const uploadsRoot = path.resolve(publicRoot, "uploads");
    const resolvedPath = path.resolve(publicRoot, `.${file.documentUrl}`);

    if (
      resolvedPath !== uploadsRoot &&
      !resolvedPath.startsWith(`${uploadsRoot}${path.sep}`)
    ) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    let stats;
    try {
      stats = await fs.stat(resolvedPath);
    } catch {
      return NextResponse.json(
        { error: "File content not found on server" },
        { status: 404 },
      );
    }

    const stream = createReadStream(resolvedPath);
    const webStream = Readable.toWeb(stream) as ReadableStream;

    return new NextResponse(webStream, {
      headers: buildStreamHeaders(
        file.fileName,
        getContentType(file.fileName),
        stats.size,
      ),
      status: 200,
    });
  } catch (error) {
    console.error("Course file download error:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 },
    );
  }
}
