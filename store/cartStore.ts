"use client";
// store/cartStore.ts
import { create } from "zustand";
import { cartApi, Cart } from "@/lib/api";

interface CartState {
  cart:       Cart | null;
  isLoading:  boolean;
  fetchCart:  () => Promise<void>;
  addItem:    (variantId: string, quantity: number) => Promise<string | null>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart:  () => Promise<void>;
  reset:      () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart:      null,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    const { data, error } = await cartApi.get();
    if (data) set({ cart: data });
    // If 401, cart stays null — the page will handle the redirect
    set({ isLoading: false });
  },

  addItem: async (variantId, quantity) => {
    set({ isLoading: true });
    const { data, error } = await cartApi.add({ variantId, quantity });
    if (data) set({ cart: data });
    set({ isLoading: false });
    return error;
  },

  updateItem: async (itemId, quantity) => {
    const { data } = await cartApi.update(itemId, quantity);
    if (data) set({ cart: data });
  },

  removeItem: async (itemId) => {
    const { data } = await cartApi.remove(itemId);
    if (data) set({ cart: data });
  },

  clearCart: async () => {
    const { data } = await cartApi.clear();
    if (data) set({ cart: data });
  },

  reset: () => set({ cart: null }),
}));