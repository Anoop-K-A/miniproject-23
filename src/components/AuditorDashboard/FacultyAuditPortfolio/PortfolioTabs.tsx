import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Button } from "../../ui/button";
import { FileText, Calendar } from "lucide-react";
import { CourseFile, EventReport } from "./types";
import { EventReportCard } from "./EventReportCard";
import { CourseCodeCards } from "./CourseCodeCards";
import { CourseReviewGroup } from "../AuditReviewInterface/CourseReviewInterface";

interface PortfolioTabsProps {
  courseFiles: CourseFile[];
  eventReports: EventReport[];
  courseFilesPage: number;
  eventReportsPage: number;
  pageSize: number;
  totalCourseFiles: number;
  totalEventReports: number;
  onCourseFilesPageChange: (page: number) => void;
  onEventReportsPageChange: (page: number) => void;
  onReviewFile: (file: CourseFile) => void;
  onReviewReport: (report: EventReport) => void;
  onReviewCourse: (group: CourseReviewGroup) => void;
  getStatusColor: (status: string) => string;
}

export function PortfolioTabs({
  courseFiles,
  eventReports,
  courseFilesPage,
  eventReportsPage,
  pageSize,
  totalCourseFiles,
  totalEventReports,
  onCourseFilesPageChange,
  onEventReportsPageChange,
  onReviewFile,
  onReviewReport,
  onReviewCourse,
  getStatusColor,
}: PortfolioTabsProps) {
  const totalCourseFilePages = Math.max(
    1,
    Math.ceil(totalCourseFiles / pageSize),
  );
  const totalEventReportPages = Math.max(
    1,
    Math.ceil(totalEventReports / pageSize),
  );

  return (
    <Tabs defaultValue="course-files">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="course-files">
          <FileText className="h-4 w-4 mr-2" />
          Course Files
        </TabsTrigger>
        <TabsTrigger value="event-reports">
          <Calendar className="h-4 w-4 mr-2" />
          Event Reports
        </TabsTrigger>
      </TabsList>

      {/* Course Files Tab - Grouped by Course Code */}
      <TabsContent value="course-files" className="space-y-4 mt-6">
        <CourseCodeCards
          courseFiles={courseFiles}
          onReviewFile={onReviewFile}
          onReviewCourse={onReviewCourse}
          getStatusColor={getStatusColor}
        />

        {totalCourseFilePages > 1 && (
          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-sm text-gray-600">
              Page {courseFilesPage} of {totalCourseFilePages} (
              {totalCourseFiles} total)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onCourseFilesPageChange(Math.max(1, courseFilesPage - 1))
                }
                disabled={courseFilesPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onCourseFilesPageChange(
                    Math.min(totalCourseFilePages, courseFilesPage + 1),
                  )
                }
                disabled={courseFilesPage >= totalCourseFilePages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </TabsContent>

      {/* Event Reports Tab */}
      <TabsContent value="event-reports" className="space-y-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {eventReports.map((report) => (
            <EventReportCard
              key={report.id}
              report={report}
              onReview={onReviewReport}
              getStatusColor={getStatusColor}
            />
          ))}
        </div>

        {totalEventReportPages > 1 && (
          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-sm text-gray-600">
              Page {eventReportsPage} of {totalEventReportPages} (
              {totalEventReports} total)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onEventReportsPageChange(Math.max(1, eventReportsPage - 1))
                }
                disabled={eventReportsPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onEventReportsPageChange(
                    Math.min(totalEventReportPages, eventReportsPage + 1),
                  )
                }
                disabled={eventReportsPage >= totalEventReportPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
