"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/stores/sidebar";
import { useAuth } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Wallet,
  ClipboardList,
  Stethoscope,
  LogOut,
  ChevronLeft,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const allNavItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Appointments", href: "/dashboard/appointments", icon: ClipboardList },
  { label: "Doctors", href: "/dashboard/doctors", icon: Stethoscope },
  // { label: "Patients", href: "/dashboard/patients", icon: User },
  // { label: "Stats", href: "/dashboard/stats", icon: BarChart3 },
  { label: "Payments", href: "/dashboard/payments", icon: Wallet },
];

const roleNavItems: Record<string, NavItem[]> = {
  doctor: allNavItems,
  admin: allNavItems,
  reception: allNavItems.filter((i) =>
    ["/dashboard", "/dashboard/appointments", "/dashboard/payments"].includes(i.href)
  ),
};

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const role = useAuth((s) => s.role) ?? "reception";
  const { logout } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const navItems = roleNavItems[role] ?? roleNavItems.reception;

  return (
    <>
      <div className="flex items-center gap-3 px-4 h-14 border-b border-sidebar-border">
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight">BMTC</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="ml-auto shrink-0 max-lg:hidden"
        >
          <ChevronLeft
            className={cn("size-4 transition-transform", collapsed && "rotate-180")}
          />
        </Button>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <item.icon className="size-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-sidebar-border space-y-1">
        {mounted && (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {resolvedTheme === "dark" ? <Sun className="size-5 shrink-0" /> : <Moon className="size-5 shrink-0" />}
            {!collapsed && <span>{resolvedTheme === "dark" ? "Light" : "Dark"}</span>}
          </Button>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={logout}
        >
          <LogOut className="size-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </>
  );
}

export function AppSidebar() {
  const { collapsed } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center gap-3 h-14 px-4 border-b bg-sidebar">
        <button
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted transition-colors"
        >
          <Menu className="size-5" />
        </button>
        <span className="font-bold text-lg tracking-tight">BMTC</span>
      </header>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute top-0 left-0 h-full w-64 bg-sidebar border-r border-sidebar-border flex flex-col shadow-xl">
            <div className="flex items-center justify-end h-14 px-4 border-b border-sidebar-border">
              <button
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
            <SidebarContent onNavClick={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <aside
        className={cn(
          "hidden lg:flex h-screen sticky top-0 bg-sidebar border-r border-sidebar-border flex-col transition-all duration-200",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
