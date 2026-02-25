import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/jsonDb";
import type { CourseRecord } from "@/lib/data/schema";

export async function GET(request: NextRequest) {
  try {
    const courses = await readJsonFile<CourseRecord[]>("courses.json");
    const facultyId = request.nextUrl.searchParams.get("facultyId");

    if (!facultyId) {
      return NextResponse.json({ courses });
    }

    const filteredCourses = courses.filter((course) =>
      course.assignedFacultyIds.includes(facultyId),
    );

    return NextResponse.json({ courses: filteredCourses });
  } catch (error) {
    console.error("Courses load error:", error);
    return NextResponse.json(
      { error: "Failed to load courses" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    if (!payload.code || !payload.name) {
      return NextResponse.json(
        { error: "Course code and name are required" },
        { status: 400 },
      );
    }

    const courses = await readJsonFile<CourseRecord[]>("courses.json");
    const timestamp = new Date().toISOString();

    const newCourse: CourseRecord = {
      id: Date.now().toString(),
      code: payload.code,
      name: payload.name,
      department: payload.department,
      semester: payload.semester,
      credits: payload.credits,
      assignedFacultyIds: payload.assignedFacultyIds ?? [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const updatedCourses = [newCourse, ...courses];
    await writeJsonFile("courses.json", updatedCourses);

    return NextResponse.json({ courses: updatedCourses });
  } catch (error) {
    console.error("Course create error:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 },
    );
  }
}
