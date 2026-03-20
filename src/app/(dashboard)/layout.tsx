"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AppHeader } from "@/components/App/AppHeader";
import { AppFooter } from "@/components/App/AppFooter";
import { Toaster } from "@/components/ui/sonner";
import { safelyNavigate } from "@/lib/safeNavigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, userRole, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      safelyNavigate(() => router.push("/login"));
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(15,76,129,0.13),transparent)]" />
      <AppHeader userRole={userRole} />
      <main className="relative flex-1">{children}</main>
      <AppFooter />
      <Toaster />
    </div>
  );
}
