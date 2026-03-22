import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,#eef4fb_0%,#f7fbff_42%,#f3f8fd_100%)]" />
      <div className="pointer-events-none absolute -top-24 -right-16 h-80 w-80 rounded-full bg-cyan-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <section className="hidden lg:block">
          <div className="max-w-xl space-y-4 rounded-3xl border border-white/60 bg-white/55 p-10 shadow-[0_24px_60px_rgba(15,38,65,0.14)] backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">
              Faculty Audit Platform
            </p>
            <h1 className="text-4xl font-bold text-slate-900">
              Built for transparent academic workflows.
            </h1>
            <p className="text-base leading-relaxed text-slate-600">
              Manage course files, event reports, and role-based reviews in one
              focused workspace designed for faculty, staff advisors, auditors,
              and administrators.
            </p>
          </div>
        </section>

        <div className="w-full max-w-md justify-self-center">{children}</div>
      </div>
    </div>
  );
}
