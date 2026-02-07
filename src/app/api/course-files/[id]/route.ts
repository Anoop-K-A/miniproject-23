import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/jsonDb";
import type { CourseFile } from "@/components/CourseFileManager/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payload = await request.json();
    const files = await readJsonFile<CourseFile[]>("courseFiles.json");
    const updatedAt = new Date().toISOString();

    const updatedFiles = files.map((file) =>
      file.id === id
        ? {
            ...file,
            ...payload,
            responseDate: payload.facultyResponse
              ? new Date().toISOString().split("T")[0]
              : file.responseDate,
            updatedAt,
          }
        : file,
    );

    await writeJsonFile("courseFiles.json", updatedFiles);

    return NextResponse.json({ files: updatedFiles });
  } catch (error) {
    console.error("Course file update error:", error);
    return NextResponse.json(
      { error: "Failed to update course file" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const files = await readJsonFile<CourseFile[]>("courseFiles.json");
    const updatedFiles = files.filter((file) => file.id !== id);
    const audits = await readJsonFile<
      {
        id: string;
        entityType: string;
        entityId: string;
      }[]
    >("audits.json");
    const remarks = await readJsonFile<
      {
        id: string;
        entityType: string;
        entityId: string;
      }[]
    >("remarks.json");

    const updatedAudits = audits.filter(
      (audit) => !(audit.entityType === "course-file" && audit.entityId === id),
    );
    const updatedRemarks = remarks.filter(
      (remark) =>
        !(remark.entityType === "course-file" && remark.entityId === id),
    );

    await writeJsonFile("courseFiles.json", updatedFiles);
    await writeJsonFile("audits.json", updatedAudits);
    await writeJsonFile("remarks.json", updatedRemarks);
    return NextResponse.json({ files: updatedFiles });
  } catch (error) {
    console.error("Course file delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete course file" },
      { status: 500 },
    );
  }
}
