import { createSlice, createSelector } from "@reduxjs/toolkit";
import {
  getCartItems,
  addItemToCart,
  updateItemQuantity,
  removeItem,
  clearCartThunk,
} from "../thunks/cartThunks";

// --- HELPER: Centralized Calculation Logic ---
// We use this to avoid repeating the reduce logic 3 times.
const updateCartTotals = (state) => {
  state.totalQuantity = state.items.reduce(
    (acc, item) => acc + item.quantity,
    0
  );
  state.totalAmount = state.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      state.error = null;
      localStorage.removeItem("cartItems");
    },
    // Useful if you modify state items manually and need a recalc
    recalculateCart: (state) => {
      updateCartTotals(state);
    },
  },
  extraReducers: (builder) => {
    builder
      // --- GET CART ---
      .addCase(getCartItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCartItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || action.payload || [];
        // Optimized: Use helper
        updateCartTotals(state);
      })
      .addCase(getCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- ADD ITEM ---
      .addCase(addItemToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.loading = false;

        const nextItems =
          action.payload?.items ||
          action.payload?.cart?.items ||
          action.payload?.data?.items ||
          null;

        if (Array.isArray(nextItems)) {
          state.items = nextItems;
          updateCartTotals(state);
        }
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- UPDATE QUANTITY ---
      .addCase(updateItemQuantity.fulfilled, (state, action) => {
        const item = state.items.find(
          (i) => (i.cartItemId || i.id) === action.payload.cartItemId
        );
        if (item) {
          item.quantity = action.payload.quantity;
        }
        // Optimized: Use helper
        updateCartTotals(state);
      })

      // --- REMOVE ITEM ---
      .addCase(removeItem.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => (item.cartItemId || item.id) !== action.payload
        );
        // Optimized: Use helper
        updateCartTotals(state);
      })

      // --- CLEAR CART (ASYNC) ---
      .addCase(clearCartThunk.fulfilled, (state) => {
        state.items = [];
        state.totalQuantity = 0;
        state.totalAmount = 0;
        localStorage.removeItem("cartItems");
      });
  },
});

export const { clearCart, recalculateCart } = cartSlice.actions;
export default cartSlice.reducer;

// --- MEMOIZED SELECTORS (Performance Boost) ---
// Use these in your components instead of raw state access.
// Example: const cartTotal = useSelector(selectCartTotalAmount);

const selectCartState = (state) => state.cart;

export const selectCartItems = createSelector(
  [selectCartState],
  (cart) => cart.items
);

export const selectCartTotalQuantity = createSelector(
  [selectCartState],
  (cart) => cart.totalQuantity
);

export const selectCartTotalAmount = createSelector(
  [selectCartState],
  (cart) => cart.totalAmount
);

export const selectCartLoading = createSelector(
  [selectCartState],
  (cart) => cart.loading
);

// --- PARAMETERIZED SELECTORS ---
// Use: useSelector((state) => selectCartQuantityByProductId(state, productId))
export const selectCartQuantityByProductId = createSelector(
  [selectCartItems, (_state, productId) => productId],
  (items, productId) => {
    if (productId === null || productId === undefined) return 0;
    const productIdStr = String(productId);

    const match = items.find((item) => {
      const itemProductId =
        item.productId ?? item.Product?.id ?? item.product?.id ?? null;
      if (itemProductId === null || itemProductId === undefined) return false;
      return String(itemProductId) === productIdStr;
    });

    return match?.quantity ?? 0;
  }
);
