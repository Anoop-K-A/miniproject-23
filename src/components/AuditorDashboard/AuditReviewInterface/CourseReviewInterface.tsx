"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Textarea } from "../../ui/textarea";
import {
  ArrowLeft,
  Download,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { ChecklistSidebar } from "./ChecklistSidebar";
import { ChecklistItem } from "./types";
import {
  CourseAuditChecklistReport,
  CourseFile,
} from "../FacultyAuditPortfolio/types";
import { useAuth } from "@/context/AuthContext";

// ── Checklists (mirrored from AuditReviewInterface/index.tsx) ──────────────

const theoryCourseFileChecklist: ChecklistItem[] = [
  { id: "co_po_mapping", label: "CO–PO Mapping (CO–PO Mapping Level)" },
  { id: "co_pso_mapping", label: "CO–PO Mapping (CO–PSO Mapping Level)" },
  { id: "justification", label: "Justification of Mapping" },
  { id: "course_coverage", label: "Course File Coverage" },
  { id: "test_qp", label: "Test (QP)" },
  { id: "test_co_level", label: "Test (CO Level)" },
  { id: "test_sample_answer", label: "Test (Sample Answer Sheets)" },
  { id: "test_qp_second", label: "Test (QP) – Second" },
  { id: "test_co_level_second", label: "Test (CO Level) – Second" },
  {
    id: "test_sample_answer_second",
    label: "Test (Sample Answer Sheets) – Second",
  },
  { id: "assignment_qp", label: "Assignment (QP)" },
  { id: "assignment_co_level", label: "Assignment (CO Level)" },
  { id: "assignment_sample", label: "Assignment (Sample)" },
  { id: "assignment_qp_second", label: "Assignment (QP) – Second" },
  { id: "assignment_co_level_second", label: "Assignment (CO Level) – Second" },
  { id: "assignment_sample_second", label: "Assignment (Sample) – Second" },
  { id: "sample_tutorial", label: "Sample Tutorial" },
  { id: "attendance", label: "Attendance (%)" },
  { id: "internal_marks", label: "Internal Marks Display" },
  { id: "course_exit_survey", label: "Course Exit Survey" },
  { id: "attainment_calculation", label: "Attainment Calculation" },
  { id: "score", label: "Score (Faculty/Auditor)" },
];

const labCourseFileChecklist: ChecklistItem[] = [
  { id: "co_po_mapping", label: "CO–PO Mapping" },
  { id: "co_pso_mapping", label: "CO–PSO Mapping" },
  { id: "justification", label: "Justification of Mapping" },
  { id: "course_coverage", label: "Course File Coverage" },
  { id: "course_execution", label: "Course Execution" },
  { id: "continuous_evaluation", label: "Continuous Evaluation" },
  { id: "internal_test_conducted", label: "Internal Test Conducted" },
  { id: "internal_test_qp", label: "Internal Test Question Paper" },
  { id: "internal_test_answers", label: "Internal Test Answer Sheets" },
  { id: "internal_test_marks", label: "Internal Test Mark Display" },
  { id: "internal_total_marks", label: "Internal Total Marks" },
  { id: "attendance", label: "Attendance (%)" },
  { id: "assignment_record", label: "Assignment / Record" },
  { id: "record_continuous_eval", label: "Record Continuous Evaluation" },
  { id: "course_exit_survey", label: "Course Exit Survey" },
  { id: "sample_record", label: "Sample Record" },
  { id: "mark_calculation", label: "Mark Calculation" },
];

const isTheoryCourseCode = (code: string) => {
  const lastLetter = (code.match(/[a-zA-Z](?!.*[a-zA-Z])/g) ?? [""])[0];
  return lastLetter.toLowerCase() === "t";
};

const getChecklistForCourse = (code: string) =>
  isTheoryCourseCode(code) ? theoryCourseFileChecklist : labCourseFileChecklist;

const normalizeChecklistStatus = (
  value?: string,
): "yes" | "no" | "pending" | undefined => {
  if (value === "yes" || value === "no" || value === "pending") {
    return value;
  }
  return undefined;
};

// ── Sort helpers ──────────────────────────────────────────────────────────────

function sortFilesByChecklist(
  files: CourseFile[],
  checklist: ChecklistItem[],
): CourseFile[] {
  const order = checklist.map((c) => c.label);
  return [...files].sort((a, b) => {
    const ai = order.indexOf(a.fileType);
    const bi = order.indexOf(b.fileType);
    return (ai === -1 ? order.length : ai) - (bi === -1 ? order.length : bi);
  });
}

function resolvePreviewType(
  documentUrl?: string,
  fileName?: string,
): "pdf" | "image" | "none" {
  if (!documentUrl || !fileName) return "none";
  const url = documentUrl.toLowerCase();
  const name = fileName.toLowerCase();
  if (url.startsWith("data:application/pdf") || name.endsWith(".pdf"))
    return "pdf";
  if (
    url.startsWith("data:image/") ||
    /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(name)
  )
    return "image";
  return "none";
}

// ── Public types ──────────────────────────────────────────────────────────────

export interface CourseReviewGroup {
  courseCode: string;
  courseName: string;
  academicYear: string;
  files: CourseFile[];
}

interface CourseReviewInterfaceProps {
  group: CourseReviewGroup;
  facultyName: string;
  facultyId?: string;
  onBack: () => void;
  onReviewCompleted?: (updatedFiles: CourseFile[]) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CourseReviewInterface({
  group,
  facultyName,
  facultyId,
  onBack,
  onReviewCompleted,
}: CourseReviewInterfaceProps) {
  const { user } = useAuth();

  const checklist = getChecklistForCourse(group.courseCode);
  const sortedFiles = sortFilesByChecklist(group.files, checklist);

  const existingChecklistReport =
    sortedFiles.find((file) => file.auditChecklistReport)
      ?.auditChecklistReport ?? null;

  const initialCheckedItems = checklist.reduce<
    Record<string, "yes" | "no" | "pending">
  >((accumulator, item) => {
    const reportStatus = normalizeChecklistStatus(
      existingChecklistReport?.checklist.find(
        (entry) => entry.id === item.id || entry.label === item.label,
      )?.status,
    );
    if (reportStatus) {
      accumulator[item.id] = reportStatus;
      return accumulator;
    }

    const matchingFileStatus = normalizeChecklistStatus(
      sortedFiles.find((file) => file.fileType === item.label)
        ?.auditChecklistStatus,
    );
    if (matchingFileStatus) {
      accumulator[item.id] = matchingFileStatus;
    }
    return accumulator;
  }, {});

  const [checkedItems, setCheckedItems] =
    useState<Record<string, "yes" | "no" | "pending">>(initialCheckedItems);
  const [auditorRemarks, setAuditorRemarks] = useState(
    existingChecklistReport?.remarks ?? sortedFiles[0]?.auditorRemarks ?? "",
  );
  const [reviewDecision, setReviewDecision] = useState<
    "approve" | "reject" | null
  >(() => {
    if (existingChecklistReport?.decision) {
      return existingChecklistReport.decision;
    }
    if (
      sortedFiles.length > 0 &&
      sortedFiles.every((file) => file.status === "Approved")
    ) {
      return "approve";
    }
    if (
      sortedFiles.length > 0 &&
      sortedFiles.every((file) => file.status === "Rejected")
    ) {
      return "reject";
    }
    return null;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buildChecklistReport = (
    isFinalized: boolean,
  ): CourseAuditChecklistReport => ({
    courseCode: group.courseCode,
    courseName: group.courseName,
    academicYear: group.academicYear,
    checklist: checklist.map((item) => ({
      id: item.id,
      label: item.label,
      status: checkedItems[item.id] ?? "pending",
    })),
    remarks: auditorRemarks.trim() || undefined,
    decision: reviewDecision ?? undefined,
    updatedBy: user?.name ?? "Auditor",
    updatedAt: new Date().toISOString(),
    isFinalized,
  });

  const handleChecklistChange = (
    itemId: string,
    value: "yes" | "no" | "pending",
  ) => {
    setCheckedItems((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleDownloadSheet = () => {
    let csv = "Checklist Item,Status\n";
    checklist.forEach((ci) => {
      csv += `"${ci.label}",${checkedItems[ci.id] ?? "pending"}\n`;
    });
    csv += `\nRemarks,"${auditorRemarks}"\n`;
    csv += `Decision,${reviewDecision ?? "pending"}\n`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-${facultyName.replace(/ /g, "_")}-${group.courseCode}-${group.academicYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Audit sheet downloaded");
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    const checklistReport = buildChecklistReport(false);
    const statusByLabel = new Map(
      checklistReport.checklist.map((entry) => [entry.label, entry.status]),
    );
    const updatedFiles: CourseFile[] = [];

    try {
      for (const file of sortedFiles) {
        const res = await fetch(`/api/course-files/${file.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            auditorRemarks: auditorRemarks.trim() || file.auditorRemarks,
            auditChecklistStatus: statusByLabel.get(file.fileType) ?? "pending",
            auditChecklistUpdatedAt: checklistReport.updatedAt,
            auditChecklistFinalized: false,
            auditChecklistReport: checklistReport,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(
            data.error || `Failed to save draft for ${file.fileName}`,
          );
          setIsSubmitting(false);
          return;
        }

        const updated = (data.files as CourseFile[]).find(
          (f) => f.id === file.id,
        );
        if (updated) {
          updatedFiles.push(updated);
        }
      }

      onReviewCompleted?.(updatedFiles);
      toast.success("Checklist draft saved");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("dashboard:data-updated"));
      }
    } catch (error) {
      console.error("Checklist draft save error:", error);
      toast.error("Failed to save checklist draft");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewDecision) {
      toast.error("Please select approve or reject");
      return;
    }
    const allChecked = checklist.every((ci) => checkedItems[ci.id]);
    if (!allChecked) {
      toast.error("Please complete all checklist items");
      return;
    }
    if (!auditorRemarks.trim()) {
      toast.error("Please provide auditor remarks");
      return;
    }

    setIsSubmitting(true);
    const status = reviewDecision === "approve" ? "Approved" : "Rejected";
    const reviewedDate = new Date().toISOString().split("T")[0];
    const reviewerName = user?.name ?? "Auditor";
    const checklistReport = buildChecklistReport(true);
    const statusByLabel = new Map(
      checklistReport.checklist.map((entry) => [entry.label, entry.status]),
    );
    const updatedFiles: CourseFile[] = [];

    try {
      for (const file of sortedFiles) {
        const res = await fetch(`/api/course-files/${file.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            adminRemarks: auditorRemarks,
            auditorRemarks,
            reviewedBy: reviewerName,
            reviewedDate,
            auditChecklistStatus: statusByLabel.get(file.fileType) ?? "pending",
            auditChecklistUpdatedAt: checklistReport.updatedAt,
            auditChecklistFinalized: true,
            auditChecklistReport: checklistReport,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || `Failed to update ${file.fileName}`);
          setIsSubmitting(false);
          return;
        }
        const updated = (data.files as CourseFile[]).find(
          (f) => f.id === file.id,
        );
        if (updated) updatedFiles.push(updated);

        // Post audit record
        await fetch("/api/audits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            auditorId: user?.id,
            entityType: "course-file",
            entityId: file.id,
            status: reviewDecision === "approve" ? "completed" : "rejected",
            remarks: auditorRemarks,
          }),
        });

        // Post remark
        await fetch("/api/remarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            authorId: user?.id,
            entityType: "course-file",
            entityId: file.id,
            status: "published",
            text: auditorRemarks,
          }),
        });
      }

      // One combined message to faculty about the whole course
      if (facultyId && sortedFiles.length > 0) {
        const firstFileId = sortedFiles[0].id;
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            facultyId,
            auditorId: user?.id,
            entityType: "course-file",
            entityId: firstFileId,
            threadId: `course-review:${group.courseCode}:${group.academicYear}`,
            senderRole: "auditor",
            senderName: user?.name,
            message:
              auditorRemarks ||
              `Course ${group.courseCode} (${group.academicYear}) ${status.toLowerCase()}.`,
            status: status.toLowerCase(),
          }),
        });
      }

      onReviewCompleted?.(updatedFiles);
      toast.success(
        `${group.courseCode} (${group.academicYear}) ${reviewDecision}d successfully`,
      );
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("dashboard:data-updated"));
      }
      onBack();
    } catch (err) {
      console.error("Course review submit error:", err);
      toast.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} type="button">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Faculty List
        </Button>
        <Button variant="outline" onClick={handleDownloadSheet} type="button">
          <Download className="h-4 w-4 mr-2" />
          Download Audit Sheet
        </Button>
      </div>

      {/* Course info bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-medium">{facultyName}</h3>
              <p className="text-sm text-gray-600">
                {group.courseCode} — {group.courseName} ({group.academicYear})
              </p>
            </div>
            <Badge
              className={
                reviewDecision === "approve"
                  ? "bg-green-100 text-green-800"
                  : ""
              }
              variant={reviewDecision === "approve" ? "default" : "outline"}
            >
              {reviewDecision === "approve" ? "Approved" : "Not Approved"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main layout: checklist left | documents right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Checklist sidebar (sticky) */}
        <ChecklistSidebar
          checklist={checklist}
          checkedItems={checkedItems}
          onChecklistChange={handleChecklistChange}
        />

        {/* Right pane: all documents stacked + remarks */}
        <div className="lg:col-span-3 space-y-6">
          {sortedFiles.map((file, idx) => {
            const previewType = resolvePreviewType(
              file.documentUrl,
              file.fileName,
            );
            const checklistPos = checklist.findIndex(
              (c) => c.label === file.fileType,
            );
            const posLabel =
              checklistPos !== -1 ? `#${checklistPos + 1}` : `Extra`;

            return (
              <Card key={file.id} className="overflow-hidden">
                <CardHeader className="pb-3 bg-gray-50 border-b">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-white bg-blue-600 px-2 py-0.5 rounded">
                        {posLabel}
                      </span>
                      <div>
                        <CardTitle className="text-sm font-semibold">
                          {file.fileType}
                        </CardTitle>
                        <p className="text-xs text-gray-500 truncate max-w-xs mt-0.5">
                          {file.fileName}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        file.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : file.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {file.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {previewType === "pdf" && file.documentUrl ? (
                    <iframe
                      src={file.documentUrl}
                      title={`Preview: ${file.fileName}`}
                      className="w-full h-125 bg-white"
                    />
                  ) : previewType === "image" && file.documentUrl ? (
                    <div className="flex items-center justify-center bg-gray-50 p-4">
                      <img
                        src={file.documentUrl}
                        alt={`Preview: ${file.fileName}`}
                        className="max-h-125 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-24 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                      <FileText className="h-7 w-7 mb-1" />
                      <p className="text-sm">No preview available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Auditor Remarks & Decision */}
          <Card>
            <CardHeader>
              <CardTitle>Auditor Remarks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Provide detailed feedback and remarks for this entire course..."
                value={auditorRemarks}
                onChange={(e) => setAuditorRemarks(e.target.value)}
                rows={6}
              />
              <div className="flex gap-4">
                <Button
                  variant={reviewDecision === "approve" ? "default" : "outline"}
                  onClick={() => setReviewDecision("approve")}
                  className="flex-1"
                  type="button"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve All
                </Button>
                <Button
                  variant={
                    reviewDecision === "reject" ? "destructive" : "outline"
                  }
                  onClick={() => setReviewDecision("reject")}
                  className="flex-1"
                  type="button"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject All
                </Button>
              </div>
              <Button
                variant="secondary"
                onClick={handleSaveDraft}
                className="w-full"
                size="lg"
                disabled={isSubmitting}
                type="button"
              >
                {isSubmitting ? "Saving…" : "Save Checklist Draft"}
              </Button>
              <Button
                onClick={handleSubmitReview}
                className="w-full"
                size="lg"
                disabled={isSubmitting}
                type="button"
              >
                {isSubmitting ? "Submitting…" : "Submit Course Review"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
