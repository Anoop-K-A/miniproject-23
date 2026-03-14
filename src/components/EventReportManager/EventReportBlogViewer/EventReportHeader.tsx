import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { ArrowLeft } from "lucide-react";
import { EventReport } from "./types";

interface EventReportHeaderProps {
  report: EventReport;
  onBack: () => void;
  getStatusColor: (status: string) => string;
}

export function EventReportHeader({
  report,
  onBack,
  getStatusColor,
}: EventReportHeaderProps) {
  return (
    <div className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <div className="flex items-center gap-3">
            {report.status && (
              <Badge className={getStatusColor(report.status)}>
                {report.status}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
