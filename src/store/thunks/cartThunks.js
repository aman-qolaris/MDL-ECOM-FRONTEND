import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCartService,
} from "../../services/cartService";

export const getCartItems = createAsyncThunk(
  "cart/getAll",
  async (_, { rejectWithValue, getState }) => {
    try {
      // Access the current user ID from Redux Auth state
      const { auth } = getState();
      const userId = auth.user?.id;

      if (!userId) return rejectWithValue("User not authenticated");

      // Pass userId to the service
      const data = await fetchCart(userId);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load cart",
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState();
      // Skip if we already have a request in flight.
      // 🟢 FIX: Replaced if-then-else with a single boolean return statement
      return !state?.cart?.loading;
    },
  },
);

export const addItemToCart = createAsyncThunk(
  "cart/add",
  async ({ productId, quantity }, { rejectWithValue, getState }) => {
    try {
      // Get User ID for the add request
      const { auth } = getState();
      const userId = auth.user?.id;

      const data = await addToCart(productId, quantity, userId);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add item",
      );
    }
  },
);

// updateItemQuantity and removeItem thunks remain largely the same
// because they rely on cartItemId, which is already passed in.
export const updateItemQuantity = createAsyncThunk(
  "cart/update",
  async ({ cartItemId, quantity }, { rejectWithValue }) => {
    try {
      const data = await updateCartItem(cartItemId, quantity);
      return { cartItemId, quantity, data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update quantity",
      );
    }
  },
);

export const removeItem = createAsyncThunk(
  "cart/remove",
  async (cartItemId, { rejectWithValue }) => {
    try {
      await removeFromCart(cartItemId);
      return cartItemId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove item",
      );
    }
  },
);

export const clearCartThunk = createAsyncThunk(
  "cart/clear",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?.id;

      if (!userId) return rejectWithValue("User not authenticated");

      await clearCartService(userId);
      return { success: true };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to clear cart",
      );
    }
  },
);
