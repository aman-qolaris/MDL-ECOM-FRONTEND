import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom"; // 🟢 URL Tool
import { setFilters } from "../../store/slices/filterSlice";
import { getAllCategories } from "../../services/productService";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const ProductFilters = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // 🟢 Make the URL the ONLY boss of the Checkboxes!
  const activeCategories = searchParams.getAll("category").filter(Boolean);

  const { minPrice, maxPrice } = useSelector((state) => state.filters);

  // Local state for price inputs
  const [localMin, setLocalMin] = useState(minPrice || "");
  const [localMax, setLocalMax] = useState(maxPrice || "");

  const [categories, setCategories] = useState([]);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);

  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories from DB
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const data = await getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = (categoryName) => {
    // 🟢 We ONLY update the URL here. No Redux fighting!
    const newParams = new URLSearchParams(searchParams);

    // Remove all existing category params, then re-append the new set
    const nextCategories = activeCategories.includes(categoryName)
      ? activeCategories.filter((c) => c !== categoryName)
      : [...activeCategories, categoryName];

    newParams.delete("category");
    nextCategories.forEach((c) => newParams.append("category", c));

    setSearchParams(newParams);
  };

  const applyPriceFilter = () => {
    dispatch(setFilters({ minPrice: localMin, maxPrice: localMax }));

    const newParams = new URLSearchParams(searchParams);
    if (localMin) newParams.set("minPrice", localMin);
    else newParams.delete("minPrice");

    if (localMax) newParams.set("maxPrice", localMax);
    else newParams.delete("maxPrice");

    setSearchParams(newParams);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      {/* Clickable Header for Minimize/Maximize */}
      <div
        className="flex justify-between items-center mb-4 cursor-pointer hover:text-blue-600 transition-colors select-none"
        onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
      >
        <h3 className="font-bold text-gray-800">Categories</h3>
        {isCategoriesOpen ? (
          <FaChevronUp className="text-gray-500 text-sm" />
        ) : (
          <FaChevronDown className="text-gray-500 text-sm" />
        )}
      </div>

      {/* Collapsible List with Checkboxes */}
      {isCategoriesOpen && (
        <ul className="space-y-2 mb-6 transition-all duration-300">
          {isLoading ? (
            <li className="text-sm text-gray-400 italic">
              Loading categories...
            </li>
          ) : categories.length === 0 ? (
            <li className="text-sm text-gray-500 italic">
              No categories found.
            </li>
          ) : (
            categories.map((cat) => (
              <li key={cat.id}>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeCategories.includes(cat.name)} // 🟢 Reads straight from URL!
                    onChange={() => handleCategoryChange(cat.name)}
                    className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span
                    className={`text-sm ${
                      activeCategories.includes(cat.name)
                        ? "text-blue-600 font-medium"
                        : "text-gray-600"
                    }`}
                  >
                    {cat.name}
                  </span>
                </label>
              </li>
            ))
          )}
        </ul>
      )}

      {/* Price Filter Section */}
      <div className="border-t pt-4">
        <h3 className="font-bold text-gray-800 mb-4">Price Range</h3>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Min"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={applyPriceFilter}
          className="mt-3 w-full bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700 transition"
        >
          Apply Price
        </button>
      </div>
    </div>
  );
};

export default ProductFilters;
