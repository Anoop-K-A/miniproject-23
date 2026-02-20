import { readJsonFile, writeJsonFile } from "@/lib/jsonDb";
import type {
  AssignmentRecord,
  EngagementRecord,
  ResponsibilityRecord,
} from "@/lib/data/schema";

interface CourseFileRecord {
  id: string;
  facultyId: string;
}

interface EventReportRecord {
  id: string;
  facultyId: string;
}

interface EngagementCounts {
  uploadsCount: number;
  activityParticipationCount: number;
  responsibilitiesCount: number;
  courseCompletionCount: number;
}

function computeEngagementScore(counts: EngagementCounts) {
  const uploadsPoints = counts.uploadsCount * 10;
  const activityPoints = counts.activityParticipationCount * 15;
  const responsibilityPoints = counts.responsibilitiesCount * 8;
  const completionPoints = counts.courseCompletionCount * 20;
  return Math.min(
    100,
    uploadsPoints + activityPoints + responsibilityPoints + completionPoints,
  );
}

export async function recomputeEngagementForFaculty(facultyId: string) {
  const [
    courseFiles,
    eventReports,
    responsibilities,
    assignments,
    engagements,
  ] = await Promise.all([
    readJsonFile<CourseFileRecord[]>("courseFiles.json"),
    readJsonFile<EventReportRecord[]>("eventReports.json"),
    readJsonFile<ResponsibilityRecord[]>("responsibilities.json"),
    readJsonFile<AssignmentRecord[]>("assignments.json"),
    readJsonFile<EngagementRecord[]>("engagements.json"),
  ]);

  const uploadsCount = courseFiles.filter(
    (file) => file.facultyId === facultyId,
  ).length;
  const activityParticipationCount = eventReports.filter(
    (report) => report.facultyId === facultyId,
  ).length;
  const responsibilitiesCount = responsibilities.filter(
    (responsibility) =>
      responsibility.facultyId === facultyId &&
      responsibility.status !== "removed",
  ).length;
  const courseCompletionCount = assignments.filter(
    (assignment) =>
      assignment.facultyId === facultyId && assignment.status === "completed",
  ).length;

  const score = computeEngagementScore({
    uploadsCount,
    activityParticipationCount,
    responsibilitiesCount,
    courseCompletionCount,
  });
  const updatedAt = new Date().toISOString();

  const nextRecord: EngagementRecord = {
    id: facultyId,
    facultyId,
    uploadsCount,
    activityParticipationCount,
    responsibilitiesCount,
    courseCompletionCount,
    score,
    updatedAt,
  };

  const existingIndex = engagements.findIndex(
    (entry) => entry.facultyId === facultyId,
  );
  const nextEngagements = [...engagements];

  if (existingIndex >= 0) {
    nextEngagements[existingIndex] = nextRecord;
  } else {
    nextEngagements.unshift(nextRecord);
  }

  await writeJsonFile("engagements.json", nextEngagements);
  return nextRecord;
}

export async function recomputeAllEngagements() {
  const users = await readJsonFile<{ id: string }[]>("users.json");
  const results: EngagementRecord[] = [];
  for (const user of users) {
    results.push(await recomputeEngagementForFaculty(user.id));
  }
  return results;
}
