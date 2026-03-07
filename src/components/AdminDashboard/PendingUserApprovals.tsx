"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Building2,
  User,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PendingUser {
  id: string;
  email: string;
  name: string;
  department: string;
  createdAt: string | Date;
}

export function PendingUserApprovals() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(new Set<string>());
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    userId: string;
    action: "approve" | "reject";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching pending users...");
      const response = await fetch("/api/admin/pending-users");

      if (!response.ok) {
        const text = await response.text();
        console.error("API Error:", response.status, text);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Pending users data:", data);

      // Convert createdAt to Date objects for consistent formatting
      const usersWithDates = (data.pendingUsers || []).map((user: any) => ({
        ...user,
        createdAt:
          typeof user.createdAt === "string"
            ? new Date(user.createdAt)
            : user.createdAt,
      }));
      setPendingUsers(usersWithDates);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Failed to load pending users";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (userId: string, action: "approve" | "reject") => {
    setConfirmAction({ userId, action });
    setIsConfirmDialogOpen(true);
  };

  const confirmUserAction = async () => {
    if (!confirmAction) return;

    const { userId, action } = confirmAction;
    setLoadingUsers((prev) => new Set([...prev, userId]));

    try {
      const response = await fetch("/api/admin/pending-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          action,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        // Remove the user from the pending list
        setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        toast.error(data.error || "Failed to process action");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while processing the action");
    } finally {
      setLoadingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      setIsConfirmDialogOpen(false);
      setConfirmAction(null);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            Pending User Approvals
          </CardTitle>
          <CardDescription>
            New users awaiting admin confirmation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pending users...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Pending User Approvals
          </CardTitle>
          <CardDescription>
            New users awaiting admin confirmation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 space-y-4">
            <p className="text-red-600 font-semibold">
              Error loading pending users
            </p>
            <p className="text-gray-600 text-sm">{error}</p>
            <Button
              onClick={fetchPendingUsers}
              variant="outline"
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingUsers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            Pending User Approvals
          </CardTitle>
          <CardDescription>
            New users awaiting admin confirmation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600">No pending approvals</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Pending User Approvals
            <span className="ml-auto bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full font-semibold">
              {pendingUsers.length}
            </span>
          </CardTitle>
          <CardDescription>
            Review and approve new user registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <h3 className="font-semibold text-gray-900">
                        {user.name}
                      </h3>
                      <div className="ml-auto flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                        <Clock className="h-3 w-3" />
                        Pending
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="break-all">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span>{user.department}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(user.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleAction(user.id, "approve")}
                      disabled={loadingUsers.has(user.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50 border-red-200"
                      onClick={() => handleAction(user.id, "reject")}
                      disabled={loadingUsers.has(user.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.action === "approve"
                ? "Approve User Registration?"
                : "Reject User Registration?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.action === "approve"
                ? `Are you sure you want to approve ${
                    pendingUsers.find((u) => u.id === confirmAction?.userId)
                      ?.name
                  }? They will be able to log in immediately.`
                : `Are you sure you want to reject ${
                    pendingUsers.find((u) => u.id === confirmAction?.userId)
                      ?.name
                  }? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUserAction}
              className={
                confirmAction?.action === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {confirmAction?.action === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
