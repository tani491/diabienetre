import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Page = 'home' | 'catalog' | 'cart' | 'checkout' | 'confirmation';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
  stock: number;
}

interface AppState {
  // Hydration
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // Navigation
  currentPage: Page;
  setCurrentPage: (page: Page) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;

  // Catalog filter
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;

  // Order confirmation
  lastOrderId: string | null;
  setLastOrderId: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Hydration
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      // Navigation
      currentPage: 'home',
      setCurrentPage: (page) => set({ currentPage: page }),

      // Cart
      cart: [],
      addToCart: (item) => {
        const cart = get().cart;
        const qty = item.quantity || 1;
        const existing = cart.find((c) => c.id === item.id);
        if (existing) {
          set({
            cart: cart.map((c) =>
              c.id === item.id ? { ...c, quantity: c.quantity + qty } : c
            ),
          });
        } else {
          set({ cart: [...cart, { ...item, quantity: qty }] });
        }
      },
      removeFromCart: (id) => {
        set({ cart: get().cart.filter((c) => c.id !== id) });
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ cart: get().cart.filter((c) => c.id !== id) });
        } else {
          set({
            cart: get().cart.map((c) =>
              c.id === id ? { ...c, quantity } : c
            ),
          });
        }
      },
      clearCart: () => set({ cart: [] }),
      cartTotal: () => {
        return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      cartCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },

      // Catalog filter
      selectedCategory: 'all',
      setSelectedCategory: (category) => set({ selectedCategory: category }),

      // Order confirmation
      lastOrderId: null,
      setLastOrderId: (id) => set({ lastOrderId: id }),
    }),
    {
      name: 'diabienetre-storage',
      partialize: (state) => ({
        cart: state.cart,
        selectedCategory: state.selectedCategory,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
