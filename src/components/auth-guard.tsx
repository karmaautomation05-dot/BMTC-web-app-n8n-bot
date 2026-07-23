"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth";
import { login } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const { token, setToken, hydrate } = useAuth();
  const router = useRouter();

  useEffect(() => {
    hydrate();
    setLoading(false);
  }, [hydrate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!token) {
    return <InlineLogin onLogin={(t) => { setToken(t); router.push("/dashboard"); }} />;
  }

  return <>{children}</>;
}

function InlineLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await login(username, password);
      onLogin(res.token);
    } catch {
      setError("Invalid credentials");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-950">
      <div className="w-full max-w-sm rounded-xl bg-white dark:bg-zinc-900 shadow-xl p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto size-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">B</div>
          <h1 className="text-xl font-semibold tracking-tight">BMTC Dashboard</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950 px-3 py-2 text-sm text-red-700 dark:text-red-400">{error}</div>
          )}
          <div className="space-y-2">
            <label htmlFor="guard-username" className="text-sm font-medium">Username</label>
            <input id="guard-username" type="text" placeholder="Enter username" value={username}
              onChange={(e) => setUsername(e.target.value)} required
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="guard-password" className="text-sm font-medium">Password</label>
            <input id="guard-password" type="password" placeholder="Enter password" value={password}
              onChange={(e) => setPassword(e.target.value)} required
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
