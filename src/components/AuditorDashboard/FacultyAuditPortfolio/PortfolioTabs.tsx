import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { FileText, Calendar } from "lucide-react";
import { CourseFile, EventReport } from "./types";
import { EventReportCard } from "./EventReportCard";
import { CourseCodeCards } from "./CourseCodeCards";
import { CourseReviewGroup } from "../AuditReviewInterface/CourseReviewInterface";

interface PortfolioTabsProps {
  courseFiles: CourseFile[];
  eventReports: EventReport[];
  onReviewFile: (file: CourseFile) => void;
  onReviewReport: (report: EventReport) => void;
  onReviewCourse: (group: CourseReviewGroup) => void;
  getStatusColor: (status: string) => string;
}

export function PortfolioTabs({
  courseFiles,
  eventReports,
  onReviewFile,
  onReviewReport,
  onReviewCourse,
  getStatusColor,
}: PortfolioTabsProps) {
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
      </TabsContent>
    </Tabs>
  );
}
