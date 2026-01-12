import { createSelector } from "@reduxjs/toolkit";
import { dummyProducts } from "../../data/dummyData";

// Input Selectors
const selectProductItems = (state) => state.products.items;
const selectFilters = (state) => state.filters;

// Memoized Complex Selector
export const selectFilteredProducts = createSelector(
  [selectProductItems, selectFilters],
  (items, filters) => {
    // 1. Fallback to dummy data if API returns empty (preserving your logic)
    const sourceItems = items.length > 0 ? items : dummyProducts;

    return sourceItems
      .filter((item) => {
        // Category Filter
        const itemCategory =
          item.Category?.name || item.category?.name || item.category;
        if (filters.category && itemCategory !== filters.category) return false;

        // Price Filters
        if (filters.minPrice && item.price < parseFloat(filters.minPrice))
          return false;
        if (filters.maxPrice && item.price > parseFloat(filters.maxPrice))
          return false;

        // Search Filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const matchesName = item.name.toLowerCase().includes(searchLower);
          const matchesDesc = item.description
            ?.toLowerCase()
            .includes(searchLower);
          const matchesCategory = itemCategory
            ?.toLowerCase()
            .includes(searchLower);

          if (!matchesName && !matchesDesc && !matchesCategory) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sort === "price_low") return a.price - b.price;
        if (filters.sort === "price_high") return b.price - a.price;
        if (filters.sort === "newest")
          return new Date(b.createdAt) - new Date(a.createdAt);
        return 0; // Default (Relevance)
      });
  }
);
