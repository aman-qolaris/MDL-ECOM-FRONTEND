/* eslint-disable react/prop-types */
import { FaSearch } from "react-icons/fa";

const InventoryFilters = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  showOutOfStockOnly,
  setShowOutOfStockOnly,
  categories,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
      <div className="relative flex-1 min-w-[200px]">
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-4 items-center">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "all" ? "All Categories" : cat}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showOutOfStockOnly}
            onChange={(e) => setShowOutOfStockOnly(e.target.checked)}
            className="w-4 h-4 text-red-600 rounded focus:ring-red-500 border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700">
            Show Out of Stock
          </span>
        </label>
      </div>
    </div>
  );
};

export default InventoryFilters;
