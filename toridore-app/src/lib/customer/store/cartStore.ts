import { create } from 'zustand';

type CartItem = {
  menuId: string;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  addItem: (menuId: string, quantity?: number) => void;
  updateQuantity: (menuId: string, quantity: number) => void;
  removeItem: (menuId: string) => void;
  clearCart: () => void;
  totalCount: () => number;
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (menuId, quantity = 1) => {
    const existing = get().items.find((item) => item.menuId === menuId);
    if (existing) {
      set({
        items: get().items.map((item) =>
          item.menuId === menuId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      });
    } else {
      set({ items: [...get().items, { menuId, quantity }] });
    }
  },
  updateQuantity: (menuId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(menuId);
    } else {
      set({
        items: get().items.map((item) =>
          item.menuId === menuId ? { ...item, quantity } : item
        ),
      });
    }
  },
  removeItem: (menuId) => {
    set({ items: get().items.filter((item) => item.menuId !== menuId) });
  },
  clearCart: () => set({ items: [] }),
  totalCount: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
}));
