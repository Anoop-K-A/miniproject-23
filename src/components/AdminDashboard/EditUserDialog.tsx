import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import type { AdminUser, AdminUserStatus } from "./types";
import type { UserRole } from "@/lib/roles";

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
  }) => void;
}

interface FormData extends Omit<AdminUser, "role"> {
  role: AdminUser["role"];
  roles?: UserRole[];
}

export function EditUserDialog({
  user,
  isOpen,
  onOpenChange,
  onUpdateUser,
}: EditUserDialogProps) {
  const [formData, setFormData] = useState<FormData>(user as FormData);
  const [selectedRoles, setSelectedRoles] = useState<Set<UserRole>>(
    new Set(user.roles || [user.role]),
  );

  useEffect(() => {
    setFormData(user as FormData);
    setSelectedRoles(new Set(user.roles || [user.role]));
  }, [user]);

  const roleOptions: Array<{ value: UserRole; label: string }> = [
    { value: "faculty", label: "Faculty" },
    { value: "auditor", label: "Auditor" },
    { value: "staff-advisor", label: "Staff Advisor" },
    { value: "admin", label: "Admin" },
  ];

  const selectedRoleLabels = roleOptions
    .filter((option) => selectedRoles.has(option.value))
    .map((option) => option.label);

  const toggleRole = (role: UserRole) => {
    const newRoles = new Set(selectedRoles);
    if (newRoles.has(role)) {
      newRoles.delete(role);
    } else {
      newRoles.add(role);
    }
    setSelectedRoles(newRoles);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rolesArray = Array.from(selectedRoles);
    const primaryRole = rolesArray[0] || "faculty";

    onUpdateUser({
      id: user.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      department: formData.department || undefined,
      role: primaryRole,
      roles: rolesArray,
      status: formData.status,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
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
            <div className="col-span-1 sm:col-span-2 space-y-3">
              <Label>Roles</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="text-left">
                      {selectedRoleLabels.length === 0
                        ? "Select roles..."
                        : selectedRoleLabels.join(", ")}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-3" align="start">
                  <div className="space-y-2">
                    {roleOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`role-${option.value}`}
                          checked={selectedRoles.has(option.value)}
                          onCheckedChange={() => toggleRole(option.value)}
                        />
                        <label
                          htmlFor={`role-${option.value}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
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
