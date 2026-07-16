import { create } from "zustand";

interface AuthState {
  token: string | null;
  hydrated: boolean;
  setToken: (token: string) => void;
  hydrate: () => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  hydrated: false,
  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token, hydrated: true });
  },
  hydrate: () => {
    const token = localStorage.getItem("token");
    set({ token, hydrated: true });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ token: null });
  },
}));
