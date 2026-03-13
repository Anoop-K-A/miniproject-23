"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AdminDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [debugUsers, setDebugUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const fetchDiagnostics = async () => {
    setIsLoading(true);
    try {
      // Fetch diagnostics
      const diagResponse = await fetch("/api/admin/diagnosis");
      const diagData = await diagResponse.json();
      setDiagnostics(diagData);

      // Fetch debug users
      const usersResponse = await fetch("/api/admin/debug-users");
      const usersData = await usersResponse.json();
      setDebugUsers(usersData.users || []);

      console.log("Diagnostics:", diagData);
      console.log("Users:", usersData);
    } catch (error) {
      console.error("Error fetching diagnostics:", error);
      toast.error("Failed to fetch diagnostics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  if (!diagnostics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            System Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading diagnostics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-500" />
          System Diagnostics
          <Button
            size="sm"
            variant="outline"
            onClick={fetchDiagnostics}
            disabled={isLoading}
            className="ml-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          View current system status and database information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Collections Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              Firestore Status
            </h3>
            <div className="space-y-1 text-sm text-blue-800">
              <p>
                <span className="font-medium">Collections:</span>{" "}
                {diagnostics.collections?.length || 0}
              </p>
              <p>
                <span className="font-medium">Users:</span>{" "}
                {diagnostics.summary?.firestoreUsers || 0}
              </p>
              <p>
                <span className="font-medium">Approved:</span>{" "}
                {diagnostics.summary?.approved || 0}
              </p>
              <p>
                <span className="font-medium">Pending:</span>{" "}
                {diagnostics.summary?.pending || 0}
              </p>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">
              Firebase Auth Status
            </h3>
            <div className="space-y-1 text-sm text-purple-800">
              <p>
                <span className="font-medium">Auth Users:</span>{" "}
                {diagnostics.summary?.fireAuthUsers || 0}
              </p>
              <p className="text-xs text-purple-700 mt-2">
                Note: Auth users might include users not yet in Firestore
              </p>
            </div>
          </div>
        </div>

        {/* Collections List */}
        <div>
          <h3 className="font-semibold mb-2 text-sm">Available Collections</h3>
          <div className="flex flex-wrap gap-2">
            {diagnostics.collections?.length > 0 ? (
              diagnostics.collections.map((col: string) => (
                <span
                  key={col}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {col}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No collections found</p>
            )}
          </div>
        </div>

        {/* Toggle User Details */}
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide User Details" : "Show User Details"}
          </Button>
        </div>

        {/* User Details */}
        {showDetails && debugUsers.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 font-semibold text-sm border-b">
              Users in Firestore ({debugUsers.length})
            </div>
            <div className="divide-y max-h-64 overflow-y-auto">
              {debugUsers.map((user) => (
                <div key={user.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{user.email}</p>
                      <p className="text-xs text-gray-600">{user.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          user.approved
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {user.approved ? "Approved" : "Pending"}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showDetails && debugUsers.length === 0 && (
          <div className="text-center py-8 border rounded-lg bg-gray-50">
            <p className="text-gray-600 text-sm">No users found in Firestore</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
