import { AuthGuard } from "@/components/auth-guard";
import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-muted/20">
        <AppSidebar />
        <main className="flex-1 p-4 sm:p-6 overflow-auto pt-16 lg:pt-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
