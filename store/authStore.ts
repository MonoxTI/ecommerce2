// store/authStore.ts
"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, User } from "@/lib/api";

interface AuthState {
  user:        User | null;
  token:       string | null;
  isLoading:   boolean;
  setAuth:     (user: User, token: string) => void;
  clearAuth:   () => void;
  fetchMe:     () => Promise<void>;
  logout:      () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:      null,
      token:     null,
      isLoading: false,

      setAuth: (user, token) => set({ user, token }),

      clearAuth: () => set({ user: null, token: null }),

      fetchMe: async () => {
        const { token } = get();
        if (!token) return;
        set({ isLoading: true });
        const { data } = await authApi.me(token);
        if (data) set({ user: data });
        else set({ user: null, token: null });
        set({ isLoading: false });
      },

      logout: async () => {
        await authApi.logout();
        set({ user: null, token: null });
      },
    }),
    { name: "aura-auth", partialize: (s) => ({ token: s.token, user: s.user }) }
  )
);