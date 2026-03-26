"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialToken = searchParams.get("token") || "";

  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.error || "Verification failed");
      }
    } catch (err) {
      setError("Failed to verify email. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="text-4xl text-green-500">✓</div>
            </div>
            <CardTitle className="text-green-600">
              Email Verified Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Your email has been verified. Your profile will now be visible to
              the admin for approval.
            </p>
            <p className="text-sm text-gray-500">
              You will receive an email notification once the admin approves or
              rejects your account.
            </p>
            <p className="text-sm text-gray-500 font-medium">
              Redirecting to login...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            Enter your verification token to confirm your email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="token"
                className="text-sm font-medium text-gray-700"
              >
                Verification Token
              </label>
              <Input
                id="token"
                type="text"
                placeholder="Paste your verification token here"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={loading}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                You should have received this token in your verification email.
                If you don't see it, check your spam folder.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !token.trim()}
              className="w-full"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already verified?{" "}
                <Link href="/login" className="text-indigo-600 hover:underline">
                  Go to Login
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
