import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { DashboardStats } from "./types";

interface ReviewStatisticsProps {
  stats: DashboardStats;
}

export function ReviewStatistics({ stats }: ReviewStatisticsProps) {
  const reviewedFiles = stats.approvedFiles + stats.rejectedFiles;
  const reviewedReports = stats.approvedReports + stats.rejectedReports;
  const courseFileApprovalRate =
    reviewedFiles > 0
      ? Math.round((stats.approvedFiles / reviewedFiles) * 100)
      : 0;
  const eventReportApprovalRate =
    reviewedReports > 0
      ? Math.round((stats.approvedReports / reviewedReports) * 100)
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Statistics</CardTitle>
        <CardDescription>Overall submission quality metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Course Files Approved</span>
              <span className="text-sm font-medium">
                {courseFileApprovalRate}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${courseFileApprovalRate}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-2">
              <span>Approved: {stats.approvedFiles}</span>
              <span>Rejected: {stats.rejectedFiles}</span>
              <span>Pending: {stats.pendingFiles}</span>
              <span>Total: {stats.totalFiles}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Event Reports Approved</span>
              <span className="text-sm font-medium">
                {eventReportApprovalRate}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${eventReportApprovalRate}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-2">
              <span>Approved: {stats.approvedReports}</span>
              <span>Rejected: {stats.rejectedReports}</span>
              <span>Pending: {stats.pendingReports}</span>
              <span>Total: {stats.totalReports}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Overall Completion Rate</span>
              <span className="text-sm font-medium">
                {stats.completionRate}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${stats.completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
