import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongoDb";
import { COLLECTIONS, ensureNormalizedIndexes } from "@/lib/mongoNormalized";
import type { EventReport } from "@/components/EventReportManager/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = await getMongoDb();
    await ensureNormalizedIndexes(db);
    const { id } = await params;
    const payload = await request.json();
    const updatedAt = new Date().toISOString();

    const currentReport = await db
      .collection<EventReport>(COLLECTIONS.eventReports)
      .findOne({ id });
    await db.collection<EventReport>(COLLECTIONS.eventReports).updateOne(
      { id },
      {
        $set: {
          ...payload,
          responseDate: payload.facultyResponse
            ? new Date().toISOString().split("T")[0]
            : currentReport?.responseDate,
          updatedAt,
        },
      },
    );
    const updatedReports = (await db
      .collection<EventReport>(COLLECTIONS.eventReports)
      .find({})
      .sort({ createdAt: -1 })
      .toArray()) as EventReport[];
    return NextResponse.json({ reports: updatedReports });
  } catch (error) {
    console.error("Event report update error:", error);
    return NextResponse.json(
      { error: "Failed to update event report" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = await getMongoDb();
    await ensureNormalizedIndexes(db);
    const { id } = await params;
    await db
      .collection<EventReport>(COLLECTIONS.eventReports)
      .deleteOne({ id });
    await db
      .collection(COLLECTIONS.audits)
      .deleteMany({ entityType: "event-report", entityId: id });
    await db
      .collection(COLLECTIONS.remarks)
      .deleteMany({ entityType: "event-report", entityId: id });

    const updatedReports = (await db
      .collection<EventReport>(COLLECTIONS.eventReports)
      .find({})
      .sort({ createdAt: -1 })
      .toArray()) as EventReport[];
    return NextResponse.json({ reports: updatedReports });
  } catch (error) {
    console.error("Event report delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete event report" },
      { status: 500 },
    );
  }
}
