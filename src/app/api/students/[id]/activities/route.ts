import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getMongoDb } from "@/lib/mongoDb";
import { COLLECTIONS, ensureNormalizedIndexes } from "@/lib/mongoNormalized";
import type { Student } from "@/components/StaffAdvisorDashboard/types";
import { resolveStaffAdvisorScope } from "@/lib/staffAdvisorScope";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = await getMongoDb();
    await ensureNormalizedIndexes(db);
    const advisorScope = await resolveStaffAdvisorScope(request);
    if (!advisorScope) {
      return NextResponse.json(
        { error: "Unauthorized staff advisor context" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const payload = await request.json();

    const targetStudent = await db
      .collection<Student>(COLLECTIONS.students)
      .findOne({ id });
    if (!targetStudent || targetStudent.advisorId !== advisorScope.advisorId) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const newActivity = {
      id: `act-${randomUUID()}`,
      name: payload.name,
      community: payload.community,
      points: payload.points,
      date: new Date().toISOString().split("T")[0],
    };

    await db.collection<Student>(COLLECTIONS.students).updateOne(
      { id, advisorId: advisorScope.advisorId },
      {
        $push: { activities: newActivity },
        $inc: { activityPoints: payload.points },
        $set: { updatedAt: new Date().toISOString() },
      },
    );

    const updatedStudent = await db
      .collection<Student>(COLLECTIONS.students)
      .findOne({ id });
    return NextResponse.json({ student: updatedStudent });
  } catch (error) {
    console.error("Student activity error:", error);
    return NextResponse.json(
      { error: "Failed to add activity" },
      { status: 500 },
    );
  }
}
