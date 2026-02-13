import { useState } from "react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";
import { ChecklistSidebar } from "./ChecklistSidebar";
import { DocumentViewer } from "./DocumentViewer";
import { DocumentDetails } from "./DocumentDetails";
import { AuditorRemarks } from "./AuditorRemarks";
import { AuditReviewInterfaceProps, ChecklistItem } from "./types";
import { useAuth } from "@/context/AuthContext";
import {
  downloadFromDataUrl,
  downloadJsonFile,
  downloadTextFile,
  sanitizeFileName,
} from "@/lib/download";

const courseFileChecklist: ChecklistItem[] = [
  { id: "format", label: "Document format is correct and readable" },
];

const eventReportChecklist: ChecklistItem[] = [
  { id: "details", label: "Event details are complete and accurate" },
];

export function AuditReviewInterface({
  type,
  item,
  facultyName,
  facultyId,
  onBack,
  onReviewCompleted,
}: AuditReviewInterfaceProps) {
  const [checkedItems, setCheckedItems] = useState<
    Record<string, "yes" | "no" | "pending">
  >({});
  const [auditorRemarks, setAuditorRemarks] = useState("");
  const [reviewDecision, setReviewDecision] = useState<
    "approve" | "reject" | null
  >(null);
  const { user } = useAuth();

  const checklist =
    type === "file" ? courseFileChecklist : eventReportChecklist;

  const handleChecklistChange = (
    itemId: string,
    value: "yes" | "no" | "pending",
  ) => {
    setCheckedItems({
      ...checkedItems,
      [itemId]: value,
    });
  };

  const handleSubmitReview = async () => {
    if (!reviewDecision) {
      toast.error("Please select approve or reject");
      return;
    }

    const status = reviewDecision === "approve" ? "Approved" : "Rejected";
    const reviewedDate = new Date().toISOString().split("T")[0];
    const reviewerName = user?.name ?? "Auditor";

    try {
      const reviewPayload = {
        status,
        adminRemarks: auditorRemarks,
        reviewedBy: reviewerName,
        reviewedDate,
      };

      const reviewResponse = await fetch(
        type === "file"
          ? `/api/course-files/${item.id}`
          : `/api/event-reports/${item.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reviewPayload),
        },
      );

      const reviewData = await reviewResponse.json();
      if (!reviewResponse.ok) {
        toast.error(reviewData.error || "Review update failed");
        return;
      }

      const updatedItem = (
        type === "file" ? reviewData.files : reviewData.reports
      )
        .filter((entry: typeof item) => entry.id === item.id)
        .reduce<typeof item | undefined>(
          (acc, entry) => acc ?? entry,
          undefined,
        );

      if (updatedItem) {
        onReviewCompleted?.(updatedItem);
      }

      await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditorId: user?.id,
          entityType: type === "file" ? "course-file" : "event-report",
          entityId: item.id,
          status: reviewDecision === "approve" ? "completed" : "rejected",
          remarks: auditorRemarks,
        }),
      });

      await fetch("/api/remarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorId: user?.id,
          entityType: type === "file" ? "course-file" : "event-report",
          entityId: item.id,
          status: "published",
          text: auditorRemarks,
        }),
      });

      if (facultyId) {
        const threadId = `${type === "file" ? "course-file" : "event-report"}:${item.id}`;
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            facultyId,
            auditorId: user?.id,
            entityType: type === "file" ? "course-file" : "event-report",
            entityId: item.id,
            threadId,
            senderRole: "auditor",
            senderName: user?.name,
            message:
              auditorRemarks ||
              `${type === "file" ? "Course file" : "Event report"} ${status.toLowerCase()}.`,
            status: status.toLowerCase(),
          }),
        });
      }

      toast.success(
        `${type === "file" ? "Course file" : "Event report"} ${reviewDecision}d successfully`,
      );
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("dashboard:data-updated"));
      }
      onBack();
    } catch (error) {
      console.error("Review submit error:", error);
      toast.error("Failed to submit review");
    }
  };

  const handleDownloadSheet = () => {
    // Create CSV content
    let csvContent = "Checklist Item,Status\n";
    checklist.forEach((item) => {
      const status = checkedItems[item.id] || "pending";
      csvContent += `"${item.label}",${status}\n`;
    });
    csvContent += `\nRemarks,"${auditorRemarks}"\n`;
    csvContent += `Decision,${reviewDecision || "pending"}\n`;

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const itemName =
      type === "file"
        ? (item as any).fileName
        : (item as any).eventName?.replace(/ /g, "_") || "report";
    link.download = `audit-${facultyName.replace(/ /g, "_")}-${itemName}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success("Audit sheet downloaded successfully");
  };

  const handleDownloadDocument = () => {
    if (type === "file") {
      const fileItem = item as { fileName: string; documentUrl?: string };
      const safeName = sanitizeFileName(fileItem.fileName, "course-file");
      if (fileItem.documentUrl) {
        downloadFromDataUrl(fileItem.documentUrl, safeName);
        toast.success(`Downloading ${fileItem.fileName}`);
        return;
      }

      const baseName = safeName.replace(/\.[^/.]+$/, "");
      const summaryName = `${baseName || "course-file"}-summary.txt`;
      const summary = [
        `File Name: ${fileItem.fileName}`,
        "Document data is not available in storage.",
      ].join("\n");
      downloadTextFile(summary, summaryName);
      toast.success(`Downloaded summary for ${fileItem.fileName}`);
      return;
    }

    const reportItem = item as { eventName: string };
    const safeName = sanitizeFileName(reportItem.eventName, "event-report");
    const fileName = `${safeName || "event-report"}.json`;
    downloadJsonFile(item, fileName);
    toast.success(`Downloading ${reportItem.eventName}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Faculty List
        </Button>
        <Button variant="outline" onClick={handleDownloadSheet}>
          <Download className="h-4 w-4 mr-2" />
          Download Audit Sheet
        </Button>
      </div>

      {/* Faculty Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">{facultyName}</h3>
              <p className="text-sm text-gray-600">
                {type === "file" ? "Course File Review" : "Event Report Review"}
              </p>
            </div>
            <div className="flex gap-2">
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
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Checklist Sidebar */}
        <ChecklistSidebar
          checklist={checklist}
          checkedItems={checkedItems}
          onChecklistChange={handleChecklistChange}
        />

        {/* Document Viewer & Details - Right Side */}
        <div className="lg:col-span-3 space-y-6">
          {/* Document Viewer */}
          <DocumentViewer
            type={type}
            item={item}
            onDownload={handleDownloadDocument}
          />

          {/* Document Details */}
          <DocumentDetails type={type} item={item} />

          {/* Auditor Remarks */}
          <AuditorRemarks
            type={type}
            item={item}
            auditorRemarks={auditorRemarks}
            onRemarksChange={setAuditorRemarks}
            reviewDecision={reviewDecision}
            onDecisionChange={setReviewDecision}
            onSubmit={handleSubmitReview}
            checklist={checklist}
            checkedItems={checkedItems}
          />
        </div>
      </div>
    </div>
  );
}
