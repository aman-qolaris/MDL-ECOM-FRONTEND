import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaArrowLeft, FaFilter } from "react-icons/fa";
import useDebounce from "../hooks/useDebounce";

// Thunks & Actions
import { getAllProducts } from "../store/thunks/productThunks";
import { setFilters } from "../store/slices/filterSlice";

// Selectors & Components
import { selectProductLoading } from "../store/slices/productSlice";
import { selectFilteredProducts } from "../store/selectors/productSelectors";
import ProductFilters from "../components/products/ProductFilters";
import ProductCard from "../components/common/ProductCard";
import ProductCardSkeleton from "../components/placeholders/ProductCardSkeleton";
import VirtualizedProductGrid from "../components/common/VirtualizedProductGrid";

const Shop = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // 1. Optimized Data Subscription
  const displayItems = useSelector(selectFilteredProducts);
  const loading = useSelector(selectProductLoading);
  const filters = useSelector((state) => state.filters);
  const debouncedFilters = useDebounce(filters, 250);

  const renderProductCard = useCallback(
    (product) => <ProductCard product={product} />,
    [],
  );

  // 🟢 2. Clean URL Params Sync
  useEffect(() => {
    const categoriesFromURL = searchParams.getAll("category").filter(Boolean);
    const searchFromURL = searchParams.get("search") || "";

    // Safely update Redux based on the URL so products fetch automatically
    dispatch(
      setFilters({
        categories: categoriesFromURL,
        search: searchFromURL,
      }),
    );
  }, [searchParams, dispatch]); // 🚨 Notice filters.category is GONE from this array!

  // 3. Data Fetching
  useEffect(() => {
    // Keep API params backward-compatible: only send a single `category`.
    // Multi-select categories are handled client-side via selectFilteredProducts.
    const serverParams = { ...debouncedFilters };
    const activeCategories = Array.isArray(serverParams.categories)
      ? serverParams.categories.filter(Boolean)
      : [];

    delete serverParams.categories;
    delete serverParams.category;

    if (activeCategories.length === 1) {
      serverParams.category = activeCategories[0];
    }

    if (serverParams.sort === "default") {
      delete serverParams.sort;
    }

    dispatch(getAllProducts(serverParams));
  }, [dispatch, debouncedFilters]);

  const handleSortChange = (e) => {
    dispatch(setFilters({ sort: e.target.value }));
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 min-h-screen">
      <button
        onClick={() => navigate("/")}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition cursor-pointer"
      >
        <FaArrowLeft /> Back
      </button>

      {/* Mobile Filter Toggle */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md active:scale-95 transition cursor-pointer"
        >
          <FaFilter /> <span>Filters</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside
          className={`w-full md:w-1/4 ${isMobileFiltersOpen ? "block" : "hidden md:block"}`}
        >
          <ProductFilters />
        </aside>

        {/* Main Content */}
        <div className="w-full md:w-3/4">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-600">
              {loading ? (
                <span>Searching...</span>
              ) : (
                <>
                  Showing{" "}
                  <span className="font-bold text-gray-900">
                    {displayItems.length}
                  </span>{" "}
                  results
                </>
              )}
            </p>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <label className="text-sm text-gray-600 hidden sm:block">
                Sort By:
              </label>
              <select
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer w-full sm:w-auto"
                value={filters.sort || "newest"}
                onChange={handleSortChange}
              >
                <option value="default">Relevance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {/* Product Grid with Shimmer */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : displayItems.length > 0 ? (
            displayItems.length >= 30 ? (
              <VirtualizedProductGrid
                items={displayItems}
                renderItem={renderProductCard}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayItems.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )
          ) : (
            <div className="py-20 text-center">
              <div className="text-gray-400 mb-4 text-6xl">🔍</div>
              <h3 className="text-xl font-medium text-gray-900">
                No products found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
