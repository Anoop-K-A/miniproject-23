import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { AdminUser, AdminUserStatus } from "./types";
import type { UserRole } from "@/lib/roles";

const FACULTY_ASSIGNABLE_ROLES: UserRole[] = [
  "faculty",
  "auditor",
  "staff-advisor",
];

interface EditUserDialogProps {
  user: AdminUser;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateUser: (payload: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    department?: string;
    role: AdminUser["role"];
    roles?: UserRole[];
    status: AdminUserStatus;
    password?: string;
  }) => void;
}

interface FormData extends Omit<AdminUser, "role"> {
  role: AdminUser["role"];
  roles?: UserRole[];
  selectedRoles: UserRole[];
}

export function EditUserDialog({
  user,
  isOpen,
  onOpenChange,
  onUpdateUser,
}: EditUserDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    ...(user as FormData),
    selectedRoles: Array.isArray(user.roles) ? user.roles : [user.role],
  });

  useEffect(() => {
    setFormData({
      ...(user as FormData),
      selectedRoles: Array.isArray(user.roles) ? user.roles : [user.role],
    });
  }, [user]);

  const handleRoleToggle = (role: UserRole) => {
    setFormData((prev) => {
      const isSelected = prev.selectedRoles.includes(role);
      const newSelectedRoles = isSelected
        ? prev.selectedRoles.filter((r) => r !== role)
        : [...prev.selectedRoles, role];
      return {
        ...prev,
        selectedRoles: newSelectedRoles,
        role: newSelectedRoles.length > 0 ? newSelectedRoles[0] : prev.role,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rolesToSubmit =
      formData.selectedRoles.length > 0
        ? formData.selectedRoles
        : [formData.role];

    onUpdateUser({
      id: user.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      department: formData.department || undefined,
      role: rolesToSubmit[0],
      roles: rolesToSubmit,
      status: formData.status,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User: {user.name}</DialogTitle>
          <DialogDescription>
            Update profile details, role, and status.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">Department</Label>
              <Input
                id="edit-department"
                value={formData.department ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as AdminUserStatus,
                  })
                }
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-full space-y-3">
              <Label>Roles</Label>
              <div className="space-y-2 pl-2">
                {FACULTY_ASSIGNABLE_ROLES.map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role}`}
                      checked={formData.selectedRoles.includes(role)}
                      onCheckedChange={() => handleRoleToggle(role)}
                    />
                    <Label
                      htmlFor={`role-${role}`}
                      className="font-normal cursor-pointer"
                    >
                      {role
                        .split("-")
                        .map((part) => part[0].toUpperCase() + part.slice(1))
                        .join(" ")}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
