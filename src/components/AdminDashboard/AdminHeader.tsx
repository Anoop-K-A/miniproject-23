import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { NotificationData } from "./types";
import { AddUserDialog } from "./AddUserDialog";

interface AdminHeaderProps {
  unreadCount: number;
  notifications: NotificationData[];
  showNotifications: boolean;
  onToggleNotifications: (open: boolean) => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  addDialogOpen: boolean;
  onAddDialogOpenChange: (open: boolean) => void;
  onAddUser: (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    department?: string;
    designation?: string;
    role: "faculty" | "auditor" | "staff-advisor" | "admin";
  }) => void;
}

export function AdminHeader({
  unreadCount,
  notifications,
  showNotifications,
  onToggleNotifications,
  onMarkAllRead,
  onMarkRead,
  addDialogOpen,
  onAddDialogOpenChange,
  onAddUser,
}: AdminHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-semibold">User Management</h2>
        <p className="text-sm text-gray-600">
          Review registrations, manage roles, and update account status
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Dialog open={showNotifications} onOpenChange={onToggleNotifications}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Notifications</DialogTitle>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={onMarkAllRead}>
                    Mark all as read
                  </Button>
                )}
              </div>
            </DialogHeader>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No notifications
                </p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex gap-3 p-3 rounded-lg border ${
                      notification.read ? "bg-gray-50" : "bg-blue-50"
                    }`}
                    onClick={() => onMarkRead(notification.id)}
                  >
                    <div className="flex-1">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.timestamp}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        <AddUserDialog
          isOpen={addDialogOpen}
          onOpenChange={onAddDialogOpenChange}
          onAddUser={onAddUser}
        />
      </div>
    </div>
  );
}
