"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SignInForm } from "@/components/AuthPage/SignInForm";
import { useAuth } from "@/context/AuthContext";
import type { AuthUser } from "@/components/AuthPage/types";
import { Toaster } from "@/components/ui/sonner";
import { getDashboardPath } from "@/lib/roles";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = (user: AuthUser) => {
    login(user);

    // Set auth cookies for middleware
    document.cookie = `auth_authenticated=true; path=/`;
    document.cookie = `auth_role=${user.role}; path=/`;
    document.cookie = `auth_user=${user.username}; path=/`;

    // Redirect to dashboard
    router.replace(getDashboardPath(user.role));
  };

  return (
    <>
      <SignInForm
        onLogin={handleLogin}
        onSwitchToSignUp={() => router.push("/register")}
      />
      <Toaster />
    </>
  );
}
