import type { Metadata } from "next";
import React from "react";
import { Manrope, Sora } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "@/styles/index.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Faculty Management System",
  description: "College Faculty Management and Audit Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${manrope.variable} ${sora.variable}`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
