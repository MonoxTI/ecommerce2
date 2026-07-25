"use client";
// store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, User } from "@/lib/api";

interface AuthState {
  user:      User | null;
  isLoading: boolean;
  setAuth:   (user: User) => void;
  clearAuth: () => void;
  fetchMe:   () => Promise<void>;
  logout:    () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:      null,
      isLoading: false,

      setAuth: (user) => set({ user }),

      clearAuth: () => set({ user: null }),

      fetchMe: async () => {
        set({ isLoading: true });
        // No token param needed — the httpOnly ws_access cookie is sent
        // automatically by the browser as long as authApi.me() uses
        // `credentials: "include"` (or is same-origin).
        const { data } = await authApi.me();
        set({ user: data ?? null, isLoading: false });
      },

      logout: async () => {
        await authApi.logout();
        set({ user: null });
      },
    }),
    {
      name: "aura-auth",
      // Only `user` is ever written to localStorage — there is no
      // access/refresh token in client state to leak via XSS.
      partialize: (s) => ({ user: s.user }),
    }
  )
);