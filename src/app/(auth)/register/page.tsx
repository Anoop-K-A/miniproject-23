"use client";

import { useRouter } from "next/navigation";
import { SignUpForm } from "@/components/AuthPage/SignUpForm";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const handleSubmit = async (formData: any) => {
    try {
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Redirect to login after success
      router.push("/login");
    } catch (error) {
      console.error("Register error:", error);
      // Error is handled in the form
    }
  };

  return (
    <SignUpForm
      onSignUpSuccess={handleSubmit}
      onSwitchToSignIn={() => router.push("/login")}
    />
  );
}
