import { create } from 'zustand';

type OrderStore = {
  completedOrderIds: Set<number>;
  hasUnsavedChanges: boolean;
  addCompletedOrderId: (orderId: number) => void;
  resetCompletedOrders: () => void;
  setHasUnsavedChanges: (value: boolean) => void;
};

export const useOrderStore = create<OrderStore>((set) => ({
  completedOrderIds: new Set(),
  hasUnsavedChanges: false,

  addCompletedOrderId: (orderId) =>
    set((state) => ({
      completedOrderIds: new Set([...state.completedOrderIds, orderId]),
      hasUnsavedChanges: true,
    })),

  resetCompletedOrders: () =>
    set({
      completedOrderIds: new Set(),
      hasUnsavedChanges: false,
    }),

  setHasUnsavedChanges: (value) => set({ hasUnsavedChanges: value }),
}));
