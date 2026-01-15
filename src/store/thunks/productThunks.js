import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getProducts,
  getProductById,
  getVendorProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../services/productService";

// 1. Fetch all products (Public)
export const getAllProducts = createAsyncThunk(
  "products/getAll",
  async (params, { rejectWithValue }) => {
    try {
      const cleanedParams = Object.fromEntries(
        Object.entries(params || {}).filter(
          ([, value]) => value !== "" && value !== null && value !== undefined
        )
      );

      const data = await getProducts(cleanedParams);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  },
  {
    condition: (params, { getState }) => {
      const state = getState();
      const isLoading = state?.products?.loading;
      const hasItems = (state?.products?.items?.length || 0) > 0;

      if (isLoading) return false;

      const cleanedParams = Object.fromEntries(
        Object.entries(params || {}).filter(
          ([, value]) => value !== "" && value !== null && value !== undefined
        )
      );

      // If caller didn't pass any filters, and we already have items,
      // avoid refetching just to rerender the same data.
      if (Object.keys(cleanedParams).length === 0 && hasItems) return false;

      return true;
    },
  }
);

// 2. Fetch featured products (Public)
// Note: Since backend might not strictly filter 'featured', we fetch general list
// and let the UI slice it, or pass params if backend updates later.
export const getFeaturedProducts = createAsyncThunk(
  "products/getFeatured",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getProducts({ sort: "desc" }); // Example: Get newest
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  },
  {
    condition: (_arg, { getState }) => {
      const state = getState();
      const hasFeatured = (state?.products?.featured?.length || 0) > 0;
      if (hasFeatured) return false;
      return true;
    },
  }
);

// 3. Fetch single product (Public)
export const getProduct = createAsyncThunk(
  "products/getOne",
  async (id, { rejectWithValue }) => {
    try {
      const data = await getProductById(id);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product"
      );
    }
  }
);

// --- VENDOR & ADMIN THUNKS ---

// 4. Fetch Vendor's Own Products
export const fetchVendorProducts = createAsyncThunk(
  "products/fetchVendorProducts",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getVendorProducts();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch your products"
      );
    }
  }
);

// 5. Create New Product
export const createProductThunk = createAsyncThunk(
  "products/createProduct",
  async (productData, { rejectWithValue }) => {
    try {
      // productData is FormData here
      const data = await createProduct(productData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create product"
      );
    }
  }
);

// 6. Update Product
export const updateProductThunk = createAsyncThunk(
  "products/updateProduct",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const data = await updateProduct(id, productData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update product"
      );
    }
  }
);

// 7. Delete Product
export const deleteProductThunk = createAsyncThunk(
  "products/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      await deleteProduct(id);
      return id; // Return ID so reducer can remove it from state
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete product"
      );
    }
  }
);
