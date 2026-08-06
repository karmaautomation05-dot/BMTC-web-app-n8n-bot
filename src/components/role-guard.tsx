"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, type Role } from "@/stores/auth";

const rolePages: Record<Role, string[] | "*"> = {
  admin: "*",
  doctor: ["/dashboard", "/dashboard/appointments", "/dashboard/doctors", "/dashboard/payments", "/dashboard/patients"],
  reception: ["/dashboard", "/dashboard/appointments", "/dashboard/payments"],
};

function isAllowed(role: Role, pathname: string): boolean {
  const allowed = rolePages[role];
  if (allowed === "*") return true;
  return allowed.some((p) => {
    if (pathname === p) return true;
    if (p === "/dashboard") return false;
    return pathname.startsWith(p + "/");
  });
}

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const role = useAuth((s) => s.role);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (role && !isAllowed(role, pathname)) {
      router.replace("/dashboard");
    }
  }, [role, pathname, router]);

  return <>{children}</>;
}
