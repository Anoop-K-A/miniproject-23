"use client";

import React, { useEffect, Suspense, useState } from "react";
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
  const [isPortalSwitching, setIsPortalSwitching] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      safelyNavigate(() => router.push("/login"));
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const onPortalSwitchStart = () => {
      setIsPortalSwitching(true);
    };
    const onPortalSwitchEnd = () => {
      setIsPortalSwitching(false);
    };

    window.addEventListener("portal:switch-start", onPortalSwitchStart);
    window.addEventListener("portal:switch-end", onPortalSwitchEnd);

    return () => {
      window.removeEventListener("portal:switch-start", onPortalSwitchStart);
      window.removeEventListener("portal:switch-end", onPortalSwitchEnd);
    };
  }, []);

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
      <Suspense fallback={<div className="h-16 border-b bg-white/80" />}>
        <AppHeader userRole={userRole} />
      </Suspense>
      <main
        className={`relative flex-1 overflow-hidden transition-all duration-250 motion-reduce:transition-none ${
          isPortalSwitching
            ? "opacity-85 scale-[0.998] blur-[0.3px]"
            : "opacity-100 scale-100 blur-0"
        }`}
      >
        {isPortalSwitching && (
          <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[0.5px]" />
            <div className="absolute inset-y-0 -left-1/3 w-1/3 bg-linear-to-r from-transparent via-white/35 to-transparent animate-[portalSheen_900ms_ease-out_1]" />
          </div>
        )}
        {children}
      </main>
      <Suspense fallback={null}>
        <AppFooter />
      </Suspense>
      <Toaster />

      <style jsx>{`
        @keyframes portalSheen {
          0% {
            transform: translateX(0%);
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            transform: translateX(420%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
