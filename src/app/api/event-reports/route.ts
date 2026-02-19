import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/jsonDb";
import type { EventReport } from "@/components/EventReportManager/types";
import { recomputeEngagementForFaculty } from "@/lib/engagements";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const reports = await readJsonFile<EventReport[]>("eventReports.json");
    const users =
      await readJsonFile<{ id: string; name: string; department?: string }[]>(
        "users.json",
      );
    const facultyUser = users.find((user) => user.id === payload.facultyId);
    const timestamp = new Date().toISOString();

    const newReport: EventReport & { facultyName?: string } = {
      id: Date.now().toString(),
      facultyId: payload.facultyId,
      eventName: payload.eventName,
      community: payload.community,
      eventDate: payload.eventDate,
      description: payload.description,
      location: payload.location,
      participants: payload.participants,
      duration: payload.duration,
      objectives: payload.objectives,
      outcomes: payload.outcomes,
      thumbnailUrl: payload.thumbnailUrl,
      galleryImages: payload.galleryImages,
      status: payload.status ?? "Draft",
      submittedDate: payload.submittedDate,
      facultyCoordinator: payload.facultyCoordinator,
      department: facultyUser?.department ?? payload.department,
      facultyName: facultyUser?.name,
      eventType: payload.eventType,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const updatedReports = [newReport, ...reports];
    await writeJsonFile("eventReports.json", updatedReports);

    // Recompute engagement after report creation
    if (payload.facultyId) {
      await recomputeEngagementForFaculty(payload.facultyId);
    }

    return NextResponse.json({ reports: updatedReports });
  } catch (error) {
    console.error("Event report create error:", error);
    return NextResponse.json(
      { error: "Failed to create event report" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const reports = await readJsonFile<EventReport[]>("eventReports.json");
    const users =
      await readJsonFile<{ id: string; name: string; department?: string }[]>(
        "users.json",
      );
    const communities = await readJsonFile<string[]>(
      "reports/communities.json",
    );
    const reportsWithFaculty = reports.map((report) => {
      const facultyUser = users.find((user) => user.id === report.facultyId);
      return {
        ...report,
        facultyName: facultyUser?.name,
        department: facultyUser?.department ?? report.department,
      };
    });
    return NextResponse.json({ reports: reportsWithFaculty, communities });
  } catch (error) {
    console.error("Event report load error:", error);
    return NextResponse.json(
      { error: "Failed to load event reports" },
      { status: 500 },
    );
  }
}
