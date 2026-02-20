import { Card, CardContent } from "../../ui/card";
import { Alert, AlertDescription } from "../../ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { FileText, Calendar } from "lucide-react";
import { CourseFile, EventReport, Student } from "./types";
import { EventReportCard } from "./EventReportCard";
import { CourseCodeCards } from "./CourseCodeCards";
import { StudentListTab } from "./StudentListTab";

interface PortfolioTabsProps {
  courseFiles: CourseFile[];
  eventReports: EventReport[];
  students?: Student[];
  showStudents?: boolean;
  onViewFile: (file: CourseFile) => void;
  onViewReport: (report: EventReport) => void;
  getStatusColor: (status: string) => string;
}

export function PortfolioTabs({
  courseFiles,
  eventReports,
  students = [],
  showStudents = false,
  onViewFile,
  onViewReport,
  getStatusColor,
}: PortfolioTabsProps) {
  const tabCount = showStudents ? 3 : 2;
  const tabsClassName =
    tabCount === 3 ? "grid w-full grid-cols-3" : "grid w-full grid-cols-2";

  return (
    <Tabs defaultValue="course-files" className="w-full">
      <TabsList className={tabsClassName}>
        <TabsTrigger value="course-files" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Course Files ({courseFiles.length})
        </TabsTrigger>
        <TabsTrigger value="event-reports" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Event Reports ({eventReports.length})
        </TabsTrigger>
        {showStudents && (
          <TabsTrigger value="students" className="flex items-center gap-2">
            Students ({students.length})
          </TabsTrigger>
        )}
      </TabsList>

      {/* Course Files Tab - Grouped by Course Code */}
      <TabsContent value="course-files" className="space-y-4 mt-6">
        <CourseCodeCards
          courseFiles={courseFiles}
          onViewFile={onViewFile}
          getStatusColor={getStatusColor}
        />

        {/* Summary Stats */}
        {courseFiles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{courseFiles.length}</div>
                <p className="text-sm text-gray-500">Total Files</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {courseFiles.filter((f) => f.status === "Approved").length}
                </div>
                <p className="text-sm text-gray-500">Approved Files</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {
                    courseFiles.filter(
                      (f) => f.status === "Pending" || f.status === "Submitted",
                    ).length
                  }
                </div>
                <p className="text-sm text-gray-500">Under Review</p>
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContent>

      {/* Event Reports Tab */}
      <TabsContent value="event-reports" className="space-y-4 mt-6">
        {eventReports.length === 0 ? (
          <Alert>
            <AlertDescription className="text-sm text-gray-500">
              No event reports available yet.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eventReports.map((report) => (
                <EventReportCard
                  key={report.id}
                  report={report}
                  onView={onViewReport}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {eventReports.length}
                  </div>
                  <p className="text-sm text-gray-500">Total Reports</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {eventReports.filter((r) => r.status === "Approved").length}
                  </div>
                  <p className="text-sm text-gray-500">Approved Reports</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {eventReports.reduce((sum, r) => sum + r.participants, 0)}
                  </div>
                  <p className="text-sm text-gray-500">Total Participants</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </TabsContent>

      {showStudents && (
        <TabsContent value="students" className="space-y-4 mt-6">
          <StudentListTab students={students} />
        </TabsContent>
      )}
    </Tabs>
  );
}
