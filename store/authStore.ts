"use client";
// store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, User } from "@/lib/api";

interface AuthState {
  user:          User | null;
  token:         string | null;
  isLoading:     boolean;
  setAuth:       (user: User, token: string) => void;
  clearAuth:     () => void;
  fetchMe:       () => Promise<void>;
  logout:        () => Promise<void>;
  refreshToken:  () => Promise<string | null>;
  getValidToken: () => Promise<string | null>;
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
        const token = await get().getValidToken();
        if (!token) return;
        set({ isLoading: true });
        const { data } = await authApi.me(token);
        if (data) set({ user: data });
        else set({ user: null, token: null });
        set({ isLoading: false });
      },

      refreshToken: async () => {
        const { data } = await authApi.refresh();
        if (data?.accessToken) {
          set({ token: data.accessToken });
          return data.accessToken;
        }
        set({ user: null, token: null });
        return null;
      },

      getValidToken: async () => {
        const { token, refreshToken } = get();
        if (!token) return null;

        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const expiresAt = payload.exp * 1000;
          const fiveMinutes = 5 * 60 * 1000;

          if (expiresAt - Date.now() < fiveMinutes) {
            return await refreshToken();
          }
        } catch {
          return await refreshToken();
        }

        return token;
      },

      logout: async () => {
        await authApi.logout();
        set({ user: null, token: null });
      },
    }),
    { name: "aura-auth", partialize: (s) => ({ token: s.token, user: s.user }) }
  )
);