"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { safelyNavigate } from "@/lib/safeNavigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,#eff5fb_0%,#f8fbff_48%,#f2f7fc_100%)]" />
      <div className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-sky-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl" />

      <div className="relative w-full max-w-md rounded-2xl border border-border/60 bg-white/90 p-7 text-center shadow-[0_24px_54px_rgba(15,38,65,0.2)] backdrop-blur-md">
        <div className="mb-4 flex justify-center">
          <AlertTriangle className="h-16 w-16 text-rose-500" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          Unauthorized Access
        </h1>
        <p className="mb-6 text-slate-600">
          You don't have permission to access this page. Please contact your
          administrator if you believe this is an error.
        </p>
        <Button
          onClick={() => safelyNavigate(() => router.push("/login"))}
          className="w-full"
        >
          Return to Login
        </Button>
      </div>
    </div>
  );
}
