"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FacultySectionTabsProps {
  children: React.ReactNode;
}

function getActiveTab(pathname: string) {
  if (pathname.startsWith("/faculty/files")) return "files";
  if (pathname.startsWith("/faculty/reports")) return "reports";
  return "dashboard";
}

export function FacultySectionTabs({ children }: FacultySectionTabsProps) {
  const pathname = usePathname();
  const activeTab = getActiveTab(pathname);

  return (
    <Tabs value={activeTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
        <TabsTrigger
          value="dashboard"
          asChild
          className="flex items-center gap-2"
        >
          <Link href="/faculty/dashboard">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">Home</span>
          </Link>
        </TabsTrigger>
        <TabsTrigger value="files" asChild className="flex items-center gap-2">
          <Link href="/faculty/files">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Course Files</span>
            <span className="sm:hidden">Files</span>
          </Link>
        </TabsTrigger>
        <TabsTrigger
          value="reports"
          asChild
          className="flex items-center gap-2"
        >
          <Link href="/faculty/reports">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Event Reports</span>
            <span className="sm:hidden">Events</span>
          </Link>
        </TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab} className="space-y-6">
        {children}
      </TabsContent>
    </Tabs>
  );
}
