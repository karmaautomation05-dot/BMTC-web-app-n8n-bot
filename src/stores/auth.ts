import { create } from "zustand";

export type Role = "admin" | "doctor" | "reception";

interface AuthState {
  token: string | null;
  role: Role | null;
  hydrated: boolean;
  setSession: (token: string, role: Role) => void;
  hydrate: () => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  role: null,
  hydrated: false,
  setSession: (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    set({ token, role, hydrated: true });
  },
  hydrate: () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") as Role | null;
    set({ token, role, hydrated: true });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    set({ token: null, role: null });
  },
}));
