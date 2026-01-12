import { createSlice, createSelector } from "@reduxjs/toolkit";
import {
  getAllProducts,
  getFeaturedProducts,
  getProduct,
  fetchVendorProducts,
  createProductThunk,
  deleteProductThunk,
  updateProductThunk,
} from "../thunks/productThunks";

const initialState = {
  items: [],
  featured: [],
  currentProduct: null,
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle getAllProducts
      .addCase(getAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle getFeaturedProducts
      .addCase(getFeaturedProducts.fulfilled, (state, action) => {
        state.featured = action.payload;
      })

      // Handle getProduct
      .addCase(getProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(getProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Vendor Products
      .addCase(fetchVendorProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchVendorProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Product
      .addCase(createProductThunk.fulfilled, (state, action) => {
        const newProduct = action.payload.product || action.payload;
        state.items.push(newProduct);
      })

      // Delete Product
      .addCase(deleteProductThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })

      // Update Product
      .addCase(updateProductThunk.fulfilled, (state, action) => {
        const updatedProduct = action.payload.product || action.payload;
        const index = state.items.findIndex((p) => p.id === updatedProduct.id);

        if (index !== -1) {
          // Preserve Category object if missing in response
          if (!updatedProduct.Category && state.items[index].Category) {
            updatedProduct.Category = state.items[index].Category;
          }
          state.items[index] = updatedProduct;
        }
      });
  },
});

export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;

// --- MEMOIZED SELECTORS ---

const selectProductState = (state) => state.products;

export const selectAllProducts = createSelector(
  [selectProductState],
  (products) => products.items
);

export const selectFeaturedProducts = createSelector(
  [selectProductState],
  (products) => products.featured
);

export const selectCurrentProduct = createSelector(
  [selectProductState],
  (products) => products.currentProduct
);

export const selectProductLoading = createSelector(
  [selectProductState],
  (products) => products.loading
);
