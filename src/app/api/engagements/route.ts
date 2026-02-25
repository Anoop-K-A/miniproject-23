import { NextRequest, NextResponse } from "next/server";
import { readJsonFile } from "@/lib/jsonDb";
import { recomputeAllEngagements } from "@/lib/engagements";
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

export async function POST() {
  try {
    console.log("Recomputing engagement for all users...");
    const results = await recomputeAllEngagements();
    console.log(`Engagement recomputed for ${results.length} users`);

    return NextResponse.json({
      message: `Engagement scores recomputed for ${results.length} users`,
      engagements: results,
    });
  } catch (error) {
    console.error("Engagement recomputation error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown recomputation error";
    return NextResponse.json(
      { error: "Failed to recompute engagement scores", message },
      { status: 500 },
    );
  }
}
