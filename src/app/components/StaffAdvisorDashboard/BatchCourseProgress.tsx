import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { User } from "lucide-react";
import type { BatchCourseGroup, BatchCourseProgress } from "./types";

interface BatchCourseProgressProps {
  groups: BatchCourseGroup[];
}

export function BatchCourseProgress({ groups }: BatchCourseProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Course File Progress</CardTitle>
        <CardDescription>Individual batch completion tracking</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {groups.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No batches found. Add students to see course file progress.
          </p>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div
                key={group.progress.batchYear}
                className="grid grid-cols-1 lg:grid-cols-3 gap-4"
              >
                {/* Left: Batch Progress */}
                <div className="lg:col-span-2 space-y-3 p-4 rounded-lg border border-gray-200 bg-gray-50/50">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">
                        Batch {group.progress.batchYear || "-"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {group.progress.totalFiles} files tracked
                      </p>
                    </div>
                    <Badge variant="outline" className="font-semibold">
                      {group.progress.completionRate}% approved
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${group.progress.completionRate}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline">
                      Total {group.progress.totalFiles}
                    </Badge>
                    <Badge className="bg-green-100 text-green-800">
                      Approved {group.progress.approvedFiles}
                    </Badge>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      In Review {group.progress.inReviewFiles}
                    </Badge>
                    <Badge className="bg-red-100 text-red-800">
                      Rejected {group.progress.rejectedFiles}
                    </Badge>
                  </div>
                </div>

                {/* Right: Faculty List */}
                <div className="p-4 rounded-lg border border-gray-200 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-gray-700">
                      Faculty Teaching
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {group.faculty.length}
                    </Badge>
                  </div>
                  {group.faculty.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-2">
                      No faculty assigned
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {group.faculty.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-start gap-2 p-2 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">
                              {member.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {member.department}
                            </p>
                            <div className="flex gap-1 mt-1">
                              <Badge
                                variant="outline"
                                className="text-xs px-1 py-0 h-4"
                              >
                                {member.filesTotal} files
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
