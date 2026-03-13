import { useState } from "react";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { AuthPageProps } from "./types";
import type { SignUpFormData } from "./types";

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isSignIn, setIsSignIn] = useState(true);

  const handleSwitchToSignUp = () => {
    setIsSignIn(false);
  };

  const handleSwitchToSignIn = () => {
    setIsSignIn(true);
  };

  const handleSignUpSuccess = async (formData: SignUpFormData) => {
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

    setIsSignIn(true);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}

        {/* Right Side - Auth Form */}
        {isSignIn ? (
          <SignInForm
            onSignInSuccess={onLogin}
            onSwitchToSignUp={handleSwitchToSignUp}
          />
        ) : (
          <SignUpForm
            onSignUpSuccess={handleSignUpSuccess}
            onSwitchToSignIn={handleSwitchToSignIn}
          />
        )}
      </div>
    </div>
  );
}
