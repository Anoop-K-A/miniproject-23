"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { safelyNavigate } from "@/lib/safeNavigation";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      return;
    }

    if (userRole !== "user") {
      safelyNavigate(() => router.push("/unauthorized"));
    }
  }, [isAuthenticated, isLoading, router, userRole]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || userRole !== "user") {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {children}
    </div>
  );
}
