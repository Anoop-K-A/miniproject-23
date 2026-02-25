import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/jsonDb";
import type { CourseFile } from "@/components/CourseFileManager/types";
import { recomputeEngagementForFaculty } from "@/lib/engagements";
import { saveDataUrlAsFile } from "@/lib/fileUpload";

// Force Node.js runtime for file system operations
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Validate required fields
    if (!payload.courseCode) {
      return NextResponse.json(
        { error: "Course code is required" },
        { status: 400 },
      );
    }

    if (!payload.fileName) {
      return NextResponse.json(
        { error: "File name is required" },
        { status: 400 },
      );
    }

    const files = await readJsonFile<CourseFile[]>("courseFiles.json");
    const users =
      await readJsonFile<{ id: string; name: string; department?: string }[]>(
        "users.json",
      );
    const facultyUser = users.find((user) => user.id === payload.facultyId);
    const timestamp = new Date().toISOString();

    // Save file to course code folder and get the file path
    let documentUrl = payload.documentUrl;
    if (payload.documentUrl && payload.documentUrl.startsWith("data:")) {
      try {
        console.log(`Saving file for course code: ${payload.courseCode}`);
        documentUrl = await saveDataUrlAsFile(
          payload.courseCode,
          payload.fileName,
          payload.documentUrl,
        );
        console.log(`File saved successfully: ${documentUrl}`);
      } catch (error) {
        console.error("Error saving file to folder:", error);
        // Return error instead of falling back - we want to know if this fails
        return NextResponse.json(
          { error: "Failed to save file to disk" },
          { status: 500 },
        );
      }
    }

    const newFile: CourseFile = {
      id: Date.now().toString(),
      facultyId: payload.facultyId,
      fileName: payload.fileName,
      documentUrl: documentUrl,
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

    try {
      console.log("Writing to courseFiles.json...");
      await writeJsonFile("courseFiles.json", updatedFiles);
      console.log("courseFiles.json updated successfully");
    } catch (error) {
      console.error("Error writing courseFiles.json:", error);
      return NextResponse.json(
        { error: "Failed to save file metadata" },
        { status: 500 },
      );
    }

    // Recompute engagement after file upload
    if (payload.facultyId) {
      try {
        console.log(`Recomputing engagement for faculty: ${payload.facultyId}`);
        await recomputeEngagementForFaculty(payload.facultyId);
        console.log("Engagement recomputed successfully");
      } catch (error) {
        console.error("Error recomputing engagement:", error);
        // Don't fail the upload if engagement computation fails
        // The file is already saved and added to the database
      }
    }

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
