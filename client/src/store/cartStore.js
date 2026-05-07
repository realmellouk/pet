// store/cartStore.js — Zustand global cart state
import { create } from 'zustand';
import { cartAPI } from '../api/axios';

export const useCartStore = create((set, get) => ({
  items:   [],
  total:   0,
  loading: false,

  fetchCart: async () => {
    try {
      set({ loading: true });
      const { data } = await cartAPI.get();
      set({ items: data.data.items, total: data.data.total, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addItem: async (productId, quantity = 1) => {
    await cartAPI.add({ product_id: productId, quantity });
    get().fetchCart();
  },

  updateItem: async (id, quantity) => {
    await cartAPI.update(id, quantity);
    get().fetchCart();
  },

  removeItem: async (id) => {
    await cartAPI.remove(id);
    get().fetchCart();
  },

  clearCart: async () => {
    await cartAPI.clear();
    set({ items: [], total: 0 });
  },

  get count() {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },
}));
