import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { CourseFile, EventReport } from "./types";

interface DocumentDetailsProps {
  type: "file" | "report";
  item: CourseFile | EventReport;
}

export function DocumentDetails({ type, item }: DocumentDetailsProps) {
  const reportItem = type === "report" ? (item as EventReport) : null;
  const reportImageUrls = reportItem
    ? [reportItem.thumbnailUrl, ...(reportItem.galleryImages ?? [])].filter(
        (url, index, self): url is string =>
          Boolean(url) && self.indexOf(url) === index,
      )
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Details</CardTitle>
      </CardHeader>
      <CardContent>
        {type === "file" ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">File Type</p>
              <p>{(item as CourseFile).fileType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Upload Date</p>
              <p>{(item as CourseFile).uploadDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Course Name</p>
              <p>{(item as CourseFile).courseName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Semester</p>
              <p>{(item as CourseFile).semester}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Event Type</p>
                <p>{reportItem?.eventType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Event Date</p>
                <p>{reportItem?.eventDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p>{reportItem?.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Participants</p>
                <p>{reportItem?.participants}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Description</p>
              <p className="text-sm">{reportItem?.description}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Objectives</p>
              <p className="text-sm">{reportItem?.objectives}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Outcomes & Impact</p>
              <p className="text-sm">{reportItem?.outcomes}</p>
            </div>

            {reportImageUrls.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Event Photos</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {reportImageUrls.map((imageUrl, index) => (
                    <img
                      key={`${reportItem?.id ?? "report"}-image-${index}`}
                      src={imageUrl}
                      alt={`${reportItem?.eventName ?? "Event"} photo ${index + 1}`}
                      className="w-full h-28 rounded-lg object-cover border"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
