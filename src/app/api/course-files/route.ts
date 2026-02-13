import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/jsonDb";
import type { CourseFile } from "@/components/CourseFileManager/types";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const files = await readJsonFile<CourseFile[]>("courseFiles.json");
    const users =
      await readJsonFile<{ id: string; name: string; department?: string }[]>(
        "users.json",
      );
    const facultyUser = users.find((user) => user.id === payload.facultyId);
    const timestamp = new Date().toISOString();

    const newFile: CourseFile = {
      id: Date.now().toString(),
      facultyId: payload.facultyId,
      fileName: payload.fileName,
      documentUrl: payload.documentUrl,
      courseCode: payload.courseCode,
      courseName: payload.courseName,
      fileType: payload.fileType,
      uploadDate: payload.uploadDate,
      semester: payload.semester,
      academicYear: payload.academicYear,
      size: payload.size,
      status: payload.status ?? "Pending",
      facultyName: facultyUser?.name ?? payload.facultyName,
      department: facultyUser?.department ?? payload.department,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const updatedFiles = [newFile, ...files];
    await writeJsonFile("courseFiles.json", updatedFiles);

    return NextResponse.json({ files: updatedFiles });
  } catch (error) {
    console.error("Course file create error:", error);
    return NextResponse.json(
      { error: "Failed to create course file" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const files = await readJsonFile<CourseFile[]>("courseFiles.json");
    const users =
      await readJsonFile<{ id: string; name: string; department?: string }[]>(
        "users.json",
      );
    const fileCategories = await readJsonFile<string[]>(
      "files/course-file-categories.json",
    );
    const fileTypes = await readJsonFile<string[]>(
      "files/course-file-types.json",
    );
    const filesWithFaculty = files.map((file) => {
      const facultyUser = users.find((user) => user.id === file.facultyId);
      return {
        ...file,
        facultyName: facultyUser?.name ?? file.facultyName,
        department: facultyUser?.department ?? file.department,
      };
    });
    return NextResponse.json({
      files: filesWithFaculty,
      fileCategories,
      fileTypes,
    });
  } catch (error) {
    console.error("Course file load error:", error);
    return NextResponse.json(
      { error: "Failed to load course files" },
      { status: 500 },
    );
  }
}
