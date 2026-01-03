import { createSlice } from "@reduxjs/toolkit";
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
      .addCase(fetchVendorProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorProducts.fulfilled, (state, action) => {
        state.loading = false;
        // This updates the 'items' list with ONLY the vendor's products
        state.items = action.payload;
      })
      .addCase(fetchVendorProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 2. Create Product (Add to list immediately)
      .addCase(createProductThunk.fulfilled, (state, action) => {
        // Add the new product to the list locally so it appears without refresh
        // Note: Check if backend returns { message, product } or just product
        // Based on your backend controller: res.json({ message, product })
        if (action.payload.product) {
          state.items.push(action.payload.product);
        } else {
          // Fallback if structure is different
          state.items.push(action.payload);
        }
      })

      // 3. Delete Product (Remove from list immediately)
      .addCase(deleteProductThunk.fulfilled, (state, action) => {
        // Filter out the deleted ID
        state.items = state.items.filter((item) => item.id !== action.payload);
      })

      // 4. Update Product
      .addCase(updateProductThunk.fulfilled, (state, action) => {
        // 1. Get the new data from backend
        const updatedProduct = action.payload.product || action.payload;

        // 2. Find the item in the list
        const index = state.items.findIndex((p) => p.id === updatedProduct.id);

        if (index !== -1) {
          // 3. SAFETY: Preserve the Category Name from the old state
          // (Because backend update usually returns 'categoryId' but not the 'Category' object)
          if (!updatedProduct.Category && state.items[index].Category) {
            updatedProduct.Category = state.items[index].Category;
          }

          // 4. Update the item
          state.items[index] = updatedProduct;
        }
      });
  },
});

export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
