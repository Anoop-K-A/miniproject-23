import { useState } from "react";
import { UserPlus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { AdminUser } from "./types";
import type { UserRole } from "@/lib/roles";

interface AddUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddUser: (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    department?: string;
    designation?: string;
    role: AdminUser["role"];
    roles?: UserRole[];
  }) => void;
}

export function AddUserDialog({
  isOpen,
  onOpenChange,
  onAddUser,
}: AddUserDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    department: "",
  });
  const [selectedRoles, setSelectedRoles] = useState<Set<UserRole>>(
    new Set(["faculty"]),
  );

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

    onAddUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone || undefined,
      department: formData.department || undefined,
      role: primaryRole,
      roles: rolesArray,
    });
    onOpenChange(false);
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      department: "",
    });
    setSelectedRoles(new Set(["faculty"]));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account with role and department details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="Dr. John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@college.edu"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Temporary Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="ChangeMe@123"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              placeholder="Computer Science"
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
            />
          </div>
          <div className="space-y-3">
            <Label>Roles *</Label>
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
                        id={`add-role-${option.value}`}
                        checked={selectedRoles.has(option.value)}
                        onCheckedChange={() => toggleRole(option.value)}
                      />
                      <label
                        htmlFor={`add-role-${option.value}`}
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
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
