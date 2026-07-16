"use client";

import { useAuth } from "@/stores/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = useAuth((s) => s.token);
  const hydrated = useAuth((s) => s.hydrated);
  const hydrate = useAuth((s) => s.hydrate);
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && !token) router.replace("/login");
  }, [token, hydrated, router]);

  if (!hydrated) return null;
  if (!token) return null;

  return <>{children}</>;
}
