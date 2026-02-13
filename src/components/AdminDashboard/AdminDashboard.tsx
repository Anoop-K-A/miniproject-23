"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
import { AdminHeader } from "./AdminHeader";
import { AdminStats } from "./AdminStats";
import { UsersTable } from "./UsersTable";
import { EditUserDialog } from "./EditUserDialog";
import type { AdminUser, AdminUserStatus, NotificationData } from "./types";
import type { UserRole } from "@/lib/roles";

interface ApiUser {
  id: string;
  username: string;
  password?: string;
  name?: string;
  role?: string;
  department?: string;
  email?: string;
  phone?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  faculty: "Faculty",
  auditor: "Auditor",
  "staff-advisor": "Staff Advisor",
  admin: "Admin",
};

const ROLE_VALUES: UserRole[] = [
  "faculty",
  "auditor",
  "staff-advisor",
  "admin",
];

const STATUS_VALUES: AdminUserStatus[] = [
  "pending",
  "active",
  "inactive",
  "suspended",
  "rejected",
];

function normalizeRole(role?: string): UserRole {
  if (!role) return "faculty";
  if (ROLE_VALUES.includes(role as UserRole)) {
    return role as UserRole;
  }
  if (role === "StaffAdvisor" || role === "Staff Advisor") {
    return "staff-advisor";
  }
  if (role === "Auditor") {
    return "auditor";
  }
  return "faculty";
}

function normalizeStatus(status?: string): AdminUserStatus {
  if (!status) return "active";
  if (status === "approved" || status === "approval") {
    return "active";
  }
  if (STATUS_VALUES.includes(status as AdminUserStatus)) {
    return status as AdminUserStatus;
  }
  return "active";
}

function buildPermissions(role: UserRole) {
  return {
    upload_files: role === "faculty",
    create_reports: role === "faculty",
    view_peer_work: role !== "admin",
    audit_submissions: role === "auditor",
    manage_users: role === "admin",
    view_analytics: role !== "faculty",
  };
}

function mapApiUser(user: ApiUser): AdminUser {
  const role = normalizeRole(user.role);
  const name = user.name ?? user.username;
  return {
    id: user.id,
    name,
    email: user.email ?? user.username,
    phone: user.phone,
    department: user.department,
    designation: ROLE_LABELS[role],
    role,
    status: normalizeStatus(user.status),
    lastActive: "-",
    joinedDate: user.createdAt?.split("T")[0],
    courseFilesCount: 0,
    eventReportsCount: 0,
    completionRate: 0,
    weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
    permissions: buildPermissions(role),
  };
}

export function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to load users");
        return;
      }
      const mappedUsers = (data.users as ApiUser[]).map(mapApiUser);
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Load users error:", error);
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const filteredUsers = useMemo(() => {
    let next = [...users];

    if (searchQuery) {
      const needle = searchQuery.toLowerCase();
      next = next.filter(
        (user) =>
          user.name.toLowerCase().includes(needle) ||
          user.email.toLowerCase().includes(needle) ||
          (user.department || "").toLowerCase().includes(needle),
      );
    }

    if (filterRole !== "all") {
      next = next.filter((user) => user.role === filterRole);
    }

    if (filterStatus !== "all") {
      next = next.filter((user) => user.status === filterStatus);
    }

    return next;
  }, [users, searchQuery, filterRole, filterStatus]);

  const pushNotification = (
    message: string,
    type: NotificationData["type"],
  ) => {
    const notification: NotificationData = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: "Just now",
      read: false,
    };
    setNotifications((prev) => [notification, ...prev]);
  };

  const handleAddUser = async (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    department?: string;
    designation?: string;
    role: AdminUser["role"];
  }) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: payload.email,
          password: payload.password,
          name: payload.name,
          role: payload.role,
          department: payload.department,
          email: payload.email,
          phone: payload.phone,
          status: "active",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to add user");
        return;
      }
      setUsers((data.users as ApiUser[]).map(mapApiUser));
      toast.success(`User ${payload.name} added successfully`);
      pushNotification(`User ${payload.name} added`, "success");
    } catch (error) {
      console.error("Add user error:", error);
      toast.error("Failed to add user");
    }
  };

  const updateUser = async (id: string, payload: Partial<ApiUser>) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Update failed");
        return null;
      }
      const mappedUsers = (data.users as ApiUser[]).map(mapApiUser);
      setUsers(mappedUsers);
      return mappedUsers.find((user) => user.id === id) ?? null;
    } catch (error) {
      console.error("User update error:", error);
      toast.error("Failed to update user");
      return null;
    }
  };

  const handleUpdateUser = async (payload: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    department?: string;
    designation?: string;
    role: AdminUser["role"];
    status: AdminUserStatus;
  }) => {
    const updated = await updateUser(payload.id, {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      department: payload.department,
      role: payload.role,
      status: payload.status,
    });

    if (updated) {
      toast.success(`User ${updated.name} updated`);
      pushNotification(`User ${updated.name} updated`, "info");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Delete failed");
        return;
      }
      setUsers((data.users as ApiUser[]).map(mapApiUser));
      toast.success("User deleted successfully");
      pushNotification("User deleted", "warning");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleRoleChange = async (
    userId: string,
    newRole: AdminUser["role"],
  ) => {
    const updated = await updateUser(userId, { role: newRole });
    if (updated) {
      toast.success(`Role updated to ${ROLE_LABELS[newRole]}`);
      pushNotification(`Role updated to ${ROLE_LABELS[newRole]}`, "info");
    }
  };

  const handleStatusChange = async (
    userId: string,
    newStatus: AdminUserStatus,
  ) => {
    const updated = await updateUser(userId, { status: newStatus });
    if (updated) {
      toast.success(`Status updated to ${newStatus}`);
      pushNotification(`Status updated to ${newStatus}`, "info");
      await fetchUsers();
    }
  };

  const handleApprove = (userId: string) => {
    handleStatusChange(userId, "active");
  };

  const handleReject = (userId: string) => {
    handleStatusChange(userId, "rejected");
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        unreadCount={unreadCount}
        notifications={notifications}
        showNotifications={showNotifications}
        onToggleNotifications={setShowNotifications}
        onMarkAllRead={markAllAsRead}
        onMarkRead={markNotificationAsRead}
        addDialogOpen={isAddUserDialogOpen}
        onAddDialogOpenChange={setIsAddUserDialogOpen}
        onAddUser={handleAddUser}
      />

      <AdminStats users={users} />

      <UsersTable
        users={filteredUsers}
        searchQuery={searchQuery}
        filterRole={filterRole}
        filterStatus={filterStatus}
        onSearchChange={setSearchQuery}
        onFilterRoleChange={setFilterRole}
        onFilterStatusChange={setFilterStatus}
        onEdit={(user) => {
          setSelectedUser(user);
          setIsEditDialogOpen(true);
        }}
        onDelete={(user) => {
          setUserToDelete(user);
          setIsDeleteDialogOpen(true);
        }}
        onRoleChange={handleRoleChange}
        onStatusChange={handleStatusChange}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {selectedUser && (
        <EditUserDialog
          user={selectedUser}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onUpdateUser={handleUpdateUser}
        />
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user "{userToDelete?.name}" and
              all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (userToDelete) {
                  handleDeleteUser(userToDelete.id);
                  setIsDeleteDialogOpen(false);
                  setUserToDelete(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
