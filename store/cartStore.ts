// store/cartStore.ts
"use client";
import { create } from "zustand";
import { cartApi, Cart } from "@/lib/api";

interface CartState {
  cart:      Cart | null;
  isLoading: boolean;
  fetchCart: (token: string) => Promise<void>;
  addItem:   (variantId: string, quantity: number, token: string) => Promise<string | null>;
  updateItem:(itemId: string, quantity: number, token: string) => Promise<void>;
  removeItem:(itemId: string, token: string) => Promise<void>;
  clearCart: (token: string) => Promise<void>;
  reset:     () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart:      null,
  isLoading: false,

  fetchCart: async (token) => {
    set({ isLoading: true });
    const { data } = await cartApi.get(token);
    if (data) set({ cart: data });
    set({ isLoading: false });
  },

  addItem: async (variantId, quantity, token) => {
    set({ isLoading: true });
    const { data, error } = await cartApi.add({ variantId, quantity }, token);
    if (data) set({ cart: data });
    set({ isLoading: false });
    return error;
  },

  updateItem: async (itemId, quantity, token) => {
    const { data } = await cartApi.update(itemId, quantity, token);
    if (data) set({ cart: data });
  },

  removeItem: async (itemId, token) => {
    const { data } = await cartApi.remove(itemId, token);
    if (data) set({ cart: data });
  },

  clearCart: async (token) => {
    const { data } = await cartApi.clear(token);
    if (data) set({ cart: data });
  },

  reset: () => set({ cart: null }),
}));