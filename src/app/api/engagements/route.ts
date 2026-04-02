import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongoDb";
import { COLLECTIONS, ensureNormalizedIndexes } from "@/lib/mongoNormalized";
import type { EngagementRecord } from "@/lib/data/schema";

interface UserRecord {
  _id: unknown;
  name?: string;
  role?: string;
  roles?: string[];
}

function normalizeId(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function computeScore(
  record: Pick<
    EngagementRecord,
    | "uploadsCount"
    | "activityParticipationCount"
    | "responsibilitiesCount"
    | "courseCompletionCount"
  >,
) {
  const uploadsPoints = record.uploadsCount * 10;
  const activityPoints = record.activityParticipationCount * 15;
  const responsibilityPoints = record.responsibilitiesCount * 8;
  const completionPoints = record.courseCompletionCount * 20;
  return Math.min(
    100,
    uploadsPoints + activityPoints + responsibilityPoints + completionPoints,
  );
}

export async function GET() {
  try {
    const db = await getMongoDb();
    await ensureNormalizedIndexes(db);

    const [engagements, courseFilesCount, eventReportsCount] =
      await Promise.all([
        db
          .collection<EngagementRecord>(COLLECTIONS.engagements)
          .find({})
          .toArray(),
        db.collection(COLLECTIONS.uploadedFiles).countDocuments({}),
        db.collection(COLLECTIONS.eventReports).countDocuments({}),
      ]);

    return NextResponse.json({
      engagements,
      courseFilesCount,
      eventReportsCount,
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
    const db = await getMongoDb();
    await ensureNormalizedIndexes(db);

    const [users, uploadedFiles, eventReports, responsibilities] =
      await Promise.all([
        db.collection<UserRecord>(COLLECTIONS.users).find({}).toArray(),
        db
          .collection<{ facultyId?: unknown }>(COLLECTIONS.uploadedFiles)
          .find({})
          .toArray(),
        db
          .collection<{ facultyId?: unknown }>(COLLECTIONS.eventReports)
          .find({})
          .toArray(),
        db
          .collection<{
            facultyId?: unknown;
            status?: string;
          }>(COLLECTIONS.responsibilities)
          .find({})
          .toArray(),
      ]);

    const faculty = users.filter((user) => {
      const roles = user.roles ?? [];
      return user.role === "faculty" || roles.includes("faculty");
    });

    const now = new Date().toISOString();
    const results: EngagementRecord[] = faculty.map((facultyUser) => {
      const facultyId = normalizeId(facultyUser._id);
      const uploadsCount = uploadedFiles.filter(
        (file) => normalizeId(file.facultyId) === facultyId,
      ).length;
      const activityParticipationCount = eventReports.filter(
        (report) => normalizeId(report.facultyId) === facultyId,
      ).length;
      const responsibilitiesCount = responsibilities.filter(
        (item) =>
          normalizeId(item.facultyId) === facultyId &&
          item.status !== "removed",
      ).length;

      const nextRecord: EngagementRecord = {
        id: facultyId,
        facultyId,
        uploadsCount,
        activityParticipationCount,
        responsibilitiesCount,
        courseCompletionCount: 0,
        score: computeScore({
          uploadsCount,
          activityParticipationCount,
          responsibilitiesCount,
          courseCompletionCount: 0,
        }),
        updatedAt: now,
      };

      return nextRecord;
    });

    if (results.length > 0) {
      const bulkOps = results.map((record) => ({
        updateOne: {
          filter: { facultyId: record.facultyId },
          update: { $set: record },
          upsert: true,
        },
      }));

      await db.collection(COLLECTIONS.engagements).bulkWrite(bulkOps);
    }

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
