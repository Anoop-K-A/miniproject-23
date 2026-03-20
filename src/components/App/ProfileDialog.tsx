"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { FileText, Loader2, Upload, UserRound } from "lucide-react";
import { toast } from "sonner";

const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_RESUME_EXTENSIONS = [".pdf", ".doc", ".docx"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ProfileFormState {
  name: string;
  username: string;
  department: string;
  email: string;
  phone: string;
  experience: string;
  resumeUrl: string;
  resumeFileName: string;
}

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const EMPTY_FORM: ProfileFormState = {
  name: "",
  username: "",
  department: "",
  email: "",
  phone: "",
  experience: "",
  resumeUrl: "",
  resumeFileName: "",
};

const EMPTY_PASSWORD_FORM: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function getFileExtension(fileName: string) {
  const index = fileName.lastIndexOf(".");
  if (index < 0) {
    return "";
  }
  return fileName.slice(index).toLowerCase();
}

function deriveResumeFileName(url: string) {
  if (!url) {
    return "";
  }

  const parts = url.split("/").filter(Boolean);
  const encodedName = parts[parts.length - 1] || "";
  const decoded = decodeURIComponent(encodedName);
  const firstUnderscore = decoded.indexOf("_");
  if (firstUnderscore > 0) {
    return decoded.slice(firstUnderscore + 1);
  }
  return decoded;
}

export function ProfileDialog() {
  const { user } = useAuth();
  const isAdminUser =
    user?.role === "admin" || user?.roles?.includes("admin") === true;
  const [open, setOpen] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [form, setForm] = useState<ProfileFormState>(EMPTY_FORM);
  const [passwordForm, setPasswordForm] =
    useState<PasswordFormState>(EMPTY_PASSWORD_FORM);

  useEffect(() => {
    const loadProfile = async () => {
      if (!open || !user?.id || isAdminUser) {
        return;
      }

      setLoadingProfile(true);
      try {
        const response = await fetch(
          `/api/profile?userId=${encodeURIComponent(user.id)}`,
          {
            cache: "no-store",
          },
        );
        const data = (await response.json()) as {
          error?: string;
          user?: {
            name?: string;
            username?: string;
            department?: string;
            email?: string;
            phone?: string;
            experience?: string;
            resumeUrl?: string;
            resumeFileName?: string;
          };
        };

        if (!response.ok || !data.user) {
          toast.error(data.error || "Failed to load profile");
          return;
        }

        setForm({
          name: data.user.name ?? "",
          username: data.user.username ?? "",
          department: data.user.department ?? "",
          email: data.user.email ?? "",
          phone: data.user.phone ?? "",
          experience: data.user.experience ?? "",
          resumeUrl: data.user.resumeUrl ?? "",
          resumeFileName:
            data.user.resumeFileName ??
            deriveResumeFileName(data.user.resumeUrl ?? ""),
        });
      } catch (error) {
        console.error("Profile load error:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [open, user?.id, isAdminUser]);

  const handleSaveProfile = async () => {
    if (!user?.id) {
      return;
    }

    const normalizedEmail = form.email.trim().toLowerCase();
    if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSavingProfile(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          email: normalizedEmail,
          phone: form.phone.trim(),
          experience: form.experience.trim(),
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        toast.error(data.error || "Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("dashboard:data-updated"));
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user?.id) {
      return;
    }

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setSavingProfile(true);
    try {
      const response = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        toast.error(data.error || "Failed to update password");
        return;
      }

      setPasswordForm(EMPTY_PASSWORD_FORM);
      toast.success("Password updated successfully");
    } catch (error) {
      console.error("Password update error:", error);
      toast.error("Failed to update password");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleResumeUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!file || !user?.id) {
      return;
    }

    const extension = getFileExtension(file.name);
    if (!ALLOWED_RESUME_EXTENSIONS.includes(extension)) {
      toast.error("Only PDF, DOC, or DOCX files are allowed");
      return;
    }

    if (file.size > MAX_RESUME_SIZE_BYTES) {
      toast.error("Resume size should be less than 5MB");
      return;
    }

    setUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("resume", file);

      const response = await fetch("/api/profile/resume", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as {
        error?: string;
        resumeUrl?: string;
        resumeFileName?: string;
      };

      if (!response.ok || !data.resumeUrl) {
        toast.error(data.error || "Failed to upload resume");
        return;
      }

      setForm((prev) => ({
        ...prev,
        resumeUrl: data.resumeUrl || "",
        resumeFileName: data.resumeFileName || file.name,
      }));
      toast.success("Resume uploaded successfully");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("dashboard:data-updated"));
      }
    } catch (error) {
      console.error("Resume upload error:", error);
      toast.error("Failed to upload resume");
    } finally {
      setUploadingResume(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!user?.id}>
          <UserRound className="h-4 w-4 mr-2" />
          Profile
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>My Profile</DialogTitle>
          <DialogDescription>
            {isAdminUser
              ? "For admin accounts, only password updates are allowed."
              : "Edit your contact details, experience, and resume."}
          </DialogDescription>
        </DialogHeader>

        {loadingProfile && !isAdminUser ? (
          <div className="py-10 flex items-center justify-center text-gray-500">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading profile...
          </div>
        ) : isAdminUser ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-current-password">Current Password</Label>
              <Input
                id="profile-current-password"
                type="password"
                placeholder="Enter current password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-new-password">New Password</Label>
              <Input
                id="profile-new-password"
                type="password"
                placeholder="Enter new password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-confirm-password">
                Confirm New Password
              </Label>
              <Input
                id="profile-confirm-password"
                type="password"
                placeholder="Re-enter new password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} disabled />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={form.username} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={form.department} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-phone">Phone Number</Label>
              <Input
                id="profile-phone"
                type="text"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-experience">Experience</Label>
              <Textarea
                id="profile-experience"
                placeholder="e.g., 6 years in machine learning and curriculum design"
                rows={3}
                value={form.experience}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, experience: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Resume</Label>
              <div className="border rounded-lg p-3 space-y-3">
                {form.resumeUrl ? (
                  <a
                    href={form.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    {form.resumeFileName || "View uploaded resume"}
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">
                    No resume uploaded yet.
                  </p>
                )}

                <div>
                  <Label
                    htmlFor="profile-resume"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    {uploadingResume ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload Resume
                      </>
                    )}
                  </Label>
                  <Input
                    id="profile-resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                    disabled={uploadingResume}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Allowed formats: PDF, DOC, DOCX (max 5MB)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={savingProfile || uploadingResume}
          >
            Close
          </Button>
          {isAdminUser ? (
            <Button onClick={handleChangePassword} disabled={savingProfile}>
              {savingProfile ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          ) : (
            <Button
              onClick={handleSaveProfile}
              disabled={loadingProfile || savingProfile || uploadingResume}
            >
              {savingProfile ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
