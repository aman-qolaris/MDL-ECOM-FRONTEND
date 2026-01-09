import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  category: "",
  sort: "default",
  minPrice: "",
  maxPrice: "",
  search: "", // ✅ MUST match Shop.jsx
};

const filterSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      // Merges new filter values into existing state
      return { ...state, ...action.payload };
    },
    clearFilters: () => initialState,
  },
});

export const { setFilters, clearFilters } = filterSlice.actions;
export default filterSlice.reducer;
