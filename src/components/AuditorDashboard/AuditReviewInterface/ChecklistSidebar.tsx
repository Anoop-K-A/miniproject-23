import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { ChecklistItem } from "./types";

interface ChecklistSidebarProps {
  checklist: ChecklistItem[];
  checkedItems: Record<string, "yes" | "no" | "pending">;
  onChecklistChange: (itemId: string, value: "yes" | "no" | "pending") => void;
}

export function ChecklistSidebar({
  checklist,
  checkedItems,
  onChecklistChange,
}: ChecklistSidebarProps) {
  return (
    <div className="lg:col-span-1">
      <Card className="sticky top-4 h-fit flex flex-col rounded-lg border border-gray-200 shadow-md">
        <CardHeader className="flex-shrink-0 border-b">
          <CardTitle className="text-base">Audit Checklist</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="space-y-4 pr-2">
            {checklist.map((checkItem) => {
              const status = checkedItems[checkItem.id] || "pending";
              return (
                <div key={checkItem.id} className="space-y-2">
                  <Label className="text-sm leading-tight">
                    {checkItem.label}
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={status === "yes" ? "default" : "outline"}
                      onClick={() => onChecklistChange(checkItem.id, "yes")}
                      className="flex-1 text-xs"
                    >
                      Yes
                    </Button>
                    <Button
                      size="sm"
                      variant={status === "no" ? "destructive" : "outline"}
                      onClick={() => onChecklistChange(checkItem.id, "no")}
                      className="flex-1 text-xs"
                    >
                      No
                    </Button>
                    <Button
                      size="sm"
                      variant={status === "pending" ? "default" : "outline"}
                      onClick={() => onChecklistChange(checkItem.id, "pending")}
                      className="flex-1 text-xs"
                    >
                      Pending
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
        {/* Checklist Summary - Fixed at Bottom */}
        <div className="flex-shrink-0 pt-4 border-t px-6 pb-4 bg-white">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Yes:</span>
              <span className="font-medium">
                {Object.values(checkedItems).filter((v) => v === "yes").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>No:</span>
              <span className="font-medium">
                {Object.values(checkedItems).filter((v) => v === "no").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Pending:</span>
              <span className="font-medium">
                {checklist.length -
                  Object.keys(checkedItems).length +
                  Object.values(checkedItems).filter((v) => v === "pending")
                    .length}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
