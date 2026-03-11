import { useState } from "react";
import { ResponseDialog } from "../../shared/dialogs/ResponseDialog";
import { EventReportHeader } from "./EventReportHeader";
import { HeroImage } from "./HeroImage";
import { ArticleHeader } from "./ArticleHeader";
import { ArticleContent } from "./ArticleContent";
import { CoordinatorSection } from "./CoordinatorSection";
import { AdminReviewSection } from "./AdminReviewSection";
import { GallerySection, DownloadSection } from "./Sections";
import { GalleryLightbox } from "./GalleryLightbox";
import { EventReport, EventReportBlogViewerProps } from "./types";
import { EntityMessagesPanel } from "@/components/shared/messages/EntityMessagesPanel";

export function EventReportBlogViewer({
  report,
  onBack,
  onDownload,
  onRespondToAdminReview,
  currentUser,
}: EventReportBlogViewerProps) {
  const [isResponseOpen, setIsResponseOpen] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<
    string | null
  >(null);

  const handleResponseSubmit = (response: string) => {
    onRespondToAdminReview(response);
    setIsResponseOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Submitted":
        return "bg-blue-100 text-blue-800";
      case "Draft":
        return "bg-gray-100 text-gray-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <EventReportHeader
        report={report}
        onBack={onBack}
        onDownload={onDownload}
        getStatusColor={getStatusColor}
      />

      {/* Blog Content */}
      <article className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        <HeroImage report={report} />
        <ArticleHeader report={report} />
        <ArticleContent report={report} />
        <GallerySection
          report={report}
          onSelectImage={setSelectedGalleryImage}
        />
        <CoordinatorSection report={report} />
        <AdminReviewSection
          report={report}
          getStatusColor={getStatusColor}
          onRespondClick={() => setIsResponseOpen(true)}
          showRespond={true}
        />
        {/* Auditor–Faculty Chat */}
        <EntityMessagesPanel
          facultyId={report.facultyId}
          entityType="event-report"
          entityId={report.id}
          itemType="report"
        />
        <DownloadSection report={report} onDownload={onDownload} />
      </article>

      {/* Gallery Lightbox */}
      <GalleryLightbox
        selectedImage={selectedGalleryImage}
        onClose={() => setSelectedGalleryImage(null)}
      />

      {/* Response Dialog */}
      <ResponseDialog
        open={isResponseOpen}
        onOpenChange={setIsResponseOpen}
        onSubmit={handleResponseSubmit}
        itemType="report"
      />
    </div>
  );
}
