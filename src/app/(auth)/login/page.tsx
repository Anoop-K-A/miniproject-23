"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SignInForm } from "@/components/AuthPage/SignInForm";
import { useAuth } from "@/context/AuthContext";
import type { AuthUser } from "@/components/AuthPage/types";
import { Toaster } from "@/components/ui/sonner";
import { getDashboardPath } from "@/lib/roles";
import { safelyNavigate } from "@/lib/safeNavigation";
import { toast } from "sonner";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const hasShownRegisteredToast = React.useRef(false);

  React.useEffect(() => {
    if (hasShownRegisteredToast.current) {
      return;
    }

    if (searchParams.get("registered") !== "1") {
      return;
    }

    hasShownRegisteredToast.current = true;
    toast.success("Account created! Await admin approval before signing in.");
    safelyNavigate(() => router.replace("/login"));
  }, [router, searchParams]);

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

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginPageContent />
    </React.Suspense>
  );
}
