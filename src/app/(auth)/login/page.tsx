"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SignInForm } from "@/components/AuthPage/SignInForm";
import { useAuth } from "@/context/AuthContext";
import type { AuthUser } from "@/components/AuthPage/types";
import { Toaster } from "@/components/ui/sonner";
import { getDashboardPath } from "@/lib/roles";
import { safelyNavigate } from "@/lib/safeNavigation";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = (user: AuthUser) => {
    login(user);

    const targetRole = [user.role, ...(user.roles || [])].includes("admin")
      ? "admin"
      : user.role;

    // Redirect to dashboard
    safelyNavigate(() => router.replace(getDashboardPath(targetRole)));
  };

  return (
    <>
      <SignInForm
        onLogin={handleLogin}
        onSwitchToSignUp={() => safelyNavigate(() => router.push("/register"))}
      />
      <Toaster />
    </>
  );
}
