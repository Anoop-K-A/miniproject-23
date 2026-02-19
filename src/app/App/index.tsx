import { useState } from "react";
import { AppHeader } from "./AppHeader";
import { RoleSwitcher } from "./RoleSwitcher";
import { MainContent } from "./MainContent";
import { AppFooter } from "./AppFooter";
import { AuthPage } from "../components/AuthPage";
import { Toaster } from "../components/ui/sonner";
import { UserRole } from "./config";

export function AppLayout() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userRole, setUserRole] = useState<UserRole>("faculty");
  const [assignedRoles, setAssignedRoles] = useState<UserRole[]>(["faculty"]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (role: string) => {
    setIsAuthenticated(true);
    // Map the role from login to the internal role type
    let mappedRole: UserRole = "faculty";
    if (role === "Auditor") {
      mappedRole = "auditor";
    } else if (role === "Staff Advisor") {
      mappedRole = "staff-advisor";
    }
    setUserRole(mappedRole);
    setAssignedRoles([mappedRole]);
  };

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <AuthPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    setActiveTab("dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader userRole={userRole} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RoleSwitcher
          currentRole={userRole}
          assignedRoles={assignedRoles}
          onRoleChange={handleRoleChange}
        />
        <MainContent
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userRole={userRole}
        />
      </main>

      <Toaster />
      <AppFooter />
    </div>
  );
}
