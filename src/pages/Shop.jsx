import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaArrowLeft, FaFilter } from "react-icons/fa";

// Thunks & Actions
import { getAllProducts } from "../store/thunks/productThunks";
import { setFilters } from "../store/slices/filterSlice";

// Selectors & Components
import { selectProductLoading } from "../store/slices/productSlice";
import { selectFilteredProducts } from "../store/selectors/productSelectors";
import ProductFilters from "../components/products/ProductFilters";
import ProductCard from "../components/common/ProductCard";
import ProductCardSkeleton from "../components/placeholders/ProductCardSkeleton";

const Shop = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 1. Optimized Data Subscription
  const displayItems = useSelector(selectFilteredProducts);
  const loading = useSelector(selectProductLoading);
  const filters = useSelector((state) => state.filters);

  // 2. URL Params Sync (Keep existing logic)
  useEffect(() => {
    const categoryFromURL = searchParams.get("category");
    const searchFromURL = searchParams.get("search");

    if (categoryFromURL || searchFromURL) {
      dispatch(
        setFilters({
          category: categoryFromURL || "",
          search: searchFromURL || "",
        })
      );
    }
  }, [searchParams, dispatch]);

  // 3. Data Fetching
  useEffect(() => {
    dispatch(getAllProducts(filters));
  }, [dispatch, filters]);

  const handleSortChange = (e) => {
    dispatch(setFilters({ sort: e.target.value }));
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <button
        onClick={() => navigate("/")}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition cursor-pointer"
      >
        <FaArrowLeft /> Back
      </button>

      {/* Mobile Filter Toggle */}
      <div className="md:hidden mb-4">
        <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md active:scale-95 transition">
          <FaFilter /> <span>Filters</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-1/4 hidden md:block">
          <ProductFilters />
        </aside>

        {/* Main Content */}
        <div className="w-full md:w-3/4">
          {/* Header Bar */}
          <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
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

            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 hidden sm:block">
                Sort By:
              </label>
              <select
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                value={filters.sort || "default"}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              // Show 6 Skeletons while loading
              Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : displayItems.length > 0 ? (
              displayItems.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
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
    </div>
  );
};

export default Shop;
