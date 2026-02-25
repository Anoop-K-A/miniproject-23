"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Unauthorized Access
        </h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please contact your
          administrator if you believe this is an error.
        </p>
        <Button onClick={() => router.push("/login")} className="w-full">
          Return to Login
        </Button>
      </div>
    </div>
  );
}
