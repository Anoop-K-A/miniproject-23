import { NextRequest, NextResponse } from "next/server";
import { readJsonFile } from "@/lib/jsonDb";
import type { EngagementRecord } from "@/lib/data/schema";

interface CourseFileRecord {
  id: string;
  facultyId: string;
}

interface EventReportRecord {
  id: string;
  facultyId: string;
}

export async function GET() {
  try {
    const [engagements, courseFiles, eventReports] = await Promise.all([
      readJsonFile<EngagementRecord[]>("engagements.json").catch(() => []),
      readJsonFile<CourseFileRecord[]>("courseFiles.json").catch(() => []),
      readJsonFile<EventReportRecord[]>("eventReports.json").catch(() => []),
    ]);

    return NextResponse.json({
      engagements,
      courseFilesCount: courseFiles.length,
      eventReportsCount: eventReports.length,
    });
  } catch (error) {
    console.error("Engagement load error:", error);
    return NextResponse.json(
      { error: "Failed to load engagement data" },
      { status: 500 },
    );
  }
}
