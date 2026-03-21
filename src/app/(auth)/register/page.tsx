"use client";

import { useRouter } from "next/navigation";
import { SignUpForm } from "@/components/AuthPage/SignUpForm";
import type { SignUpFormData } from "@/components/AuthPage/types";
import { safelyNavigate } from "@/lib/safeNavigation";

export default function RegisterPage() {
  const router = useRouter();

  const handleSubmit = async (formData: SignUpFormData) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        department: formData.department,
        role: "faculty",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Registration failed");
    }

    // Redirect to login after success
    safelyNavigate(() => router.push("/login"));
  };

  return (
    <SignUpForm
      onSignUpSuccess={handleSubmit}
      onSwitchToSignIn={() => safelyNavigate(() => router.push("/login"))}
    />
  );
}
