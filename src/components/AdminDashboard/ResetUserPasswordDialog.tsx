import { useEffect, useMemo, useState } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import type { AdminUser } from "./types";

const USER_PAGE_ACCOUNT_USERNAME = "user";

interface ResetUserPasswordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  users: AdminUser[];
  onResetPassword: (newPassword: string) => Promise<boolean>;
}

export function ResetUserPasswordDialog({
  isOpen,
  onOpenChange,
  users,
  onResetPassword,
}: ResetUserPasswordDialogProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userAccounts = useMemo(
    () =>
      users.filter(
        (user) =>
          user.role === "user" ||
          (Array.isArray(user.roles) && user.roles.includes("user")) ||
          String(user.name || "")
            .trim()
            .toLowerCase() === USER_PAGE_ACCOUNT_USERNAME ||
          String(user.email || "")
            .trim()
            .toLowerCase()
            .startsWith(`${USER_PAGE_ACCOUNT_USERNAME}@`),
      ),
    [users],
  );

  const userPageAccount = useMemo(
    () =>
      userAccounts.find(
        (account) =>
          String(account.name || "")
            .trim()
            .toLowerCase() === USER_PAGE_ACCOUNT_USERNAME ||
          String(account.email || "")
            .trim()
            .toLowerCase()
            .startsWith(`${USER_PAGE_ACCOUNT_USERNAME}@`),
      ) || userAccounts[0],
    [userAccounts],
  );

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setNewPassword("");
      setConfirmPassword("");
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      return;
    }

    if (newPassword.length < 6) {
      return;
    }

    if (newPassword !== confirmPassword) {
      return;
    }

    setIsSubmitting(true);
    const success = await onResetPassword(newPassword);
    setIsSubmitting(false);

    if (success) {
      handleClose(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <KeyRound className="h-4 w-4" />
          Update User Password
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update User Password</DialogTitle>
          <DialogDescription>
            Update password for the User page account (username: User). If the
            account does not exist yet, it will be created automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <p className="font-medium">Target Account: User</p>
            <p className="text-xs text-slate-500 mt-1">
              {userPageAccount
                ? `Found as ${userPageAccount.name} (${userPageAccount.email})`
                : "No existing User account found. A new one will be created."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-user-password">New Password</Label>
            <Input
              id="reset-user-password"
              type="password"
              value={newPassword}
              placeholder="Enter new password"
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <p className="text-xs text-slate-500">Minimum 6 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-user-password-confirm">
              Confirm Password
            </Label>
            <Input
              id="reset-user-password-confirm"
              type="password"
              value={confirmPassword}
              placeholder="Re-enter new password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                newPassword.length < 6 ||
                newPassword !== confirmPassword
              }
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
