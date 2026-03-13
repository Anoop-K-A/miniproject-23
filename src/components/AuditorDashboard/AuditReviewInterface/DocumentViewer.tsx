import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { FileText, Calendar, Download } from "lucide-react";
import { CourseFile, EventReport } from "./types";

interface DocumentViewerProps {
  type: "file" | "report";
  item: CourseFile | EventReport;
  onDownload: () => void;
}

function resolvePreviewType(documentUrl?: string, fileName?: string) {
  if (!documentUrl || !fileName) {
    return "none" as const;
  }

  const lowerUrl = documentUrl.toLowerCase();
  const lowerFileName = fileName.toLowerCase();

  if (
    lowerUrl.startsWith("data:application/pdf") ||
    lowerFileName.endsWith(".pdf")
  ) {
    return "pdf" as const;
  }

  if (
    lowerUrl.startsWith("data:image/") ||
    /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(lowerFileName)
  ) {
    return "image" as const;
  }

  if (
    lowerUrl.startsWith("data:text/") ||
    /\.(txt|csv|json|md)$/.test(lowerFileName)
  ) {
    return "text" as const;
  }

  return "unsupported" as const;
}

export function DocumentViewer({
  type,
  item,
  onDownload,
}: DocumentViewerProps) {
  const fileItem = type === "file" ? (item as CourseFile) : null;
  const previewSource = fileItem?.documentUrl;
  const previewType = resolvePreviewType(previewSource, fileItem?.fileName);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {type === "file" ? (
            <FileText className="h-5 w-5" />
          ) : (
            <Calendar className="h-5 w-5" />
          )}
          Document Viewer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-16/10 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
          {type === "file" && previewSource && previewType === "pdf" && (
            <iframe
              src={previewSource}
              title={`Preview ${fileItem?.fileName ?? "document"}`}
              className="h-full w-full bg-white"
            />
          )}

          {type === "file" && previewSource && previewType === "image" && (
            <img
              src={previewSource}
              alt={fileItem?.fileName ?? "document preview"}
              className="h-full w-full object-contain bg-white"
            />
          )}

          {type === "file" && previewSource && previewType === "text" && (
            <iframe
              src={previewSource}
              title={`Preview ${fileItem?.fileName ?? "document"}`}
              className="h-full w-full bg-white"
            />
          )}

          {(type === "report" ||
            previewType === "none" ||
            previewType === "unsupported") && (
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-center px-4">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {type === "file"
                    ? `Document: ${(item as CourseFile).fileName}`
                    : `Report: ${(item as EventReport).eventName}`}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {type === "report"
                    ? "Event report preview is not available in this viewer"
                    : previewType === "none"
                      ? "No file content available for preview"
                      : "This file type cannot be previewed inline"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-center">
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download Document
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
