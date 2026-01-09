import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAllProducts } from "../store/thunks/productThunks";
import { setFilters } from "../store/slices/filterSlice"; // Updated Import
import ProductFilters from "../components/products/ProductFilters";
import ProductCard from "../components/common/ProductCard";
import { FaArrowLeft, FaFilter } from "react-icons/fa";
import { dummyProducts } from "../data/dummyData";

const Shop = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const { items, loading } = useSelector((state) => state.products);
  const filters = useSelector((state) => state.filters);

  // Set initial filter from URL parameter
  useEffect(() => {
    const categoryFromURL = searchParams.get("category");
    const searchFromURL = searchParams.get("search");

    dispatch(
      setFilters({
        category: categoryFromURL || "",
        search: searchFromURL || "",
      })
    );
  }, [searchParams, dispatch]);

  // Fetch products whenever filters change
  useEffect(() => {
    dispatch(getAllProducts(filters));
  }, [dispatch, filters]);

  // Handle Sort Change
  const handleSortChange = (e) => {
    dispatch(setFilters({ sort: e.target.value }));
  };

  // Logic to filter items
  // Note: We always apply client-side filtering because the backend
  // might return all products or broader matches than we want for the strict search experience.
  // This also handles the case where we fall back to dummyProducts.
  const displayItems = (items.length > 0 ? items : dummyProducts)
    .filter((item) => {
      // 1. Filter by Category
      const itemCategory =
        item.Category?.name || item.category?.name || item.category;
      if (filters.category && itemCategory !== filters.category) return false;

      // 2. Filter by Min Price
      if (filters.minPrice && item.price < parseFloat(filters.minPrice))
        return false;

      // 3. Filter by Max Price
      if (filters.maxPrice && item.price > parseFloat(filters.maxPrice))
        return false;

      // 4. Filter by Search Term (Name, Description, Category)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(searchLower);
        const matchesDesc = item.description
          ?.toLowerCase()
          .includes(searchLower);
        const matchesCategory = itemCategory
          ?.toLowerCase()
          .includes(searchLower);

        if (!matchesName && !matchesDesc && !matchesCategory) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (filters.sort === "price_low") return a.price - b.price;
      if (filters.sort === "price_high") return b.price - a.price;
      return 0;
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/")}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition cursor-pointer"
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>
      {/* Mobile Filter Toggle (Hidden on Desktop) */}
      <div className="md:hidden mb-4">
        <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
          <FaFilter /> <span>Filters</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4 hidden md:block">
          <ProductFilters />
        </aside>

        <div className="w-full md:w-3/4">
          <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-600">
              Showing{" "}
              <span className="font-bold text-gray-900">
                {displayItems.length}
              </span>{" "}
              results
            </p>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Sort By:</label>
              <select
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filters.sort}
                onChange={handleSortChange}
              >
                <option value="default">Relevance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">Loading products...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayItems.length > 0 ? (
                displayItems.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-gray-500">
                  No products found matching your filters.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
