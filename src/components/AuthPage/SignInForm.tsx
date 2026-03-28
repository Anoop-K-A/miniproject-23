import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { AuthUser, SignInFormData } from "./types";

interface SignInFormProps {
  onLogin?: (user: AuthUser) => void;
  onSignInSuccess?: (user: AuthUser) => void;
  onSwitchToSignUp?: () => void;
}

export function SignInForm({
  onLogin,
  onSignInSuccess,
  onSwitchToSignUp,
}: SignInFormProps) {
  const [formData, setFormData] = useState<SignInFormData>({
    username: "",
    password: "",
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [canResendVerification, setCanResendVerification] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false);

  const handleResendVerification = async () => {
    if (!formData.username.trim()) {
      toast.error("Enter your username or email to resend verification");
      return;
    }

    setIsResendingVerification(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: formData.username.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to resend verification email");
        return;
      }

      toast.success(data.message || "Verification email sent");
    } catch (error) {
      console.error("Resend verification error:", error);
      toast.error("Failed to resend verification email");
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.username.trim()) {
      toast.error("Enter your username or email to reset password");
      return;
    }

    setIsSendingPasswordReset(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: formData.username.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Unable to send password reset email");
        return;
      }

      toast.success(
        data.message ||
          "If your account exists, a password reset email has been sent.",
      );
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Unable to send password reset email");
    } finally {
      setIsSendingPasswordReset(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast.error("Please enter username and password");
      return;
    }

    setLoginError(null);
    setCanResendVerification(false);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || "Login failed";
        const needsEmailVerification =
          data.code === "EMAIL_VERIFICATION_REQUIRED";

        setLoginError(errorMessage);
        setCanResendVerification(needsEmailVerification);
        toast.error(errorMessage);
        return;
      }

      setLoginError(null);
      setCanResendVerification(false);
      toast.success("Sign in successful!");

      // Call callback with user role and roles
      const callback = onLogin || onSignInSuccess;
      if (callback) {
        callback({
          id: data.id,
          username: data.username,
          name: data.name,
          role: data.role,
          roles: data.roles || [data.role],
          department: data.department,
          emailVerified: data.emailVerified,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
    }
  };

  return (
    <Card className="w-full border border-border/60 bg-white/90 shadow-[0_24px_54px_rgba(15,38,65,0.2)] backdrop-blur-md">
      <CardHeader className="space-y-2 pb-2 text-center">
        <div className="flex justify-center mb-4 md:hidden">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-sky-500 to-blue-700 shadow-lg">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="pl-10"
              />
            </div>
          </div>

          {loginError && (
            <div className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm text-amber-800">{loginError}</p>
              {canResendVerification && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                  className="w-full"
                >
                  {isResendingVerification
                    ? "Sending verification..."
                    : "Resend verification email"}
                </Button>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-sm"
              onClick={handleForgotPassword}
              disabled={isSendingPasswordReset}
            >
              {isSendingPasswordReset
                ? "Sending reset link..."
                : "Forgot password?"}
            </Button>
          </div>

          <Button type="submit" className="w-full">
            Sign In
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              Don't have an account?{" "}
            </span>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0"
              onClick={onSwitchToSignUp}
            >
              Sign up here
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
