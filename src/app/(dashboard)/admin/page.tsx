import { AdminDashboard } from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <main className="space-y-6">
      <AdminDashboard />
    </main>
  );
}
