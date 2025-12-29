import { useEffect, useState } from "react";
// FIX 1: Import 'getProducts' (matches your updated service)
import { getProducts, deleteProduct } from "../../services/productService";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFilter } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getAllVendors } from "../../services/vendorService"; // 👈 ADD THIS IMPORT

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [vendorMap, setVendorMap] = useState({}); // 👈 1. ADD THIS STATE

  // 👇 1. ADD NEW STATE VARIABLES
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showOutOfStockOnly, setShowOutOfStockOnly] = useState(false);

  // Fetch products on load
  useEffect(() => {
    loadData();
  }, []);

  // 👇 2. REPLACE YOUR EXISTING loadProducts FUNCTION WITH THIS:
  const loadData = async () => {
    try {
      // Fetch both Products and Vendors at the same time
      const [productsData, vendorsData] = await Promise.all([
        getProducts(),
        getAllVendors(),
      ]);

      setProducts(productsData);

      // Create a quick lookup map (ID -> Business Name)
      const lookup = {};
      vendorsData.forEach((vendor) => {
        lookup[vendor.id] = vendor.businessName;
      });
      setVendorMap(lookup);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        // Remove from UI immediately so we don't need to refresh
        setProducts(products.filter((p) => p.id !== id));
      } catch (error) {
        alert("Failed to delete product");
      }
    }
  };

  // 👇 2. ADD THIS DYNAMIC FILTERING LOGIC
  // This automatically recalculates whenever search, category, or stock changes
  const filteredProducts = products.filter((product) => {
    // A. Search by Name (Case insensitive)
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // B. Filter by Category
    const categoryName =
      product.Category?.name || product.category || "Uncategorized";
    const matchesCategory =
      selectedCategory === "all" || categoryName === selectedCategory;

    // C. Filter by Stock
    const matchesStock = showOutOfStockOnly ? product.stock <= 0 : true;

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Get unique categories dynamically from the loaded products
  const categories = [
    "all",
    ...new Set(
      products.map((p) => p.Category?.name || p.category || "Uncategorized")
    ),
  ];

  if (loading) return <div className="p-6">Loading products...</div>;

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Products</h2>
        <Link
          to="/admin/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <FaPlus /> Add Product
        </Link>
      </div>

      {/* 👇 3. ADD THIS SEARCH AND FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
        {/* Left: Search Input */}
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

        {/* Right: Filters */}
        <div className="flex gap-4 items-center">
          {/* Category Dropdown */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-3 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Toggle */}
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showOutOfStockOnly}
              onChange={(e) => setShowOutOfStockOnly(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded focus:ring-red-500 border-gray-300"
            />
            Show Out of Stock
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Product</th>
              <th className="py-3 px-6 text-left">Category</th>
              <th className="py-3 px-6 text-left">Owner</th>
              <th className="py-3 px-6 text-center">Price</th>
              <th className="py-3 px-6 text-center">Stock</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-md overflow-hidden border border-gray-200 mr-3">
                      <img
                        src={
                          product.imageUrl || "https://via.placeholder.com/150"
                        }
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <span className="font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="py-3 px-6 text-left">
                  <span className="bg-blue-100 text-blue-600 py-1 px-3 rounded-full text-xs">
                    {/* Handle nested Category object from backend */}
                    {product.Category?.name ||
                      product.category ||
                      "Uncategorized"}
                  </span>
                </td>
                {/* 👇 ADD THIS NEW CELL for OWNER */}
                <td className="py-3 px-6 text-left">
                  {product.vendorId ? (
                    <span className="bg-purple-100 text-purple-700 py-1 px-3 rounded-full text-xs font-bold border border-purple-200">
                      {vendorMap[product.vendorId] ||
                        `Vendor #${product.vendorId}`}{" "}
                    </span>
                  ) : (
                    <span className="bg-gray-800 text-white py-1 px-3 rounded-full text-xs font-bold">
                      Admin
                    </span>
                  )}
                </td>
                <td className="py-3 px-6 text-center font-bold">
                  ₹{product.price}
                </td>
                <td className="py-3 px-6 text-center">
                  <span
                    className={
                      product.stock > 0
                        ? "text-green-600 font-semibold"
                        : "text-red-500 font-semibold"
                    }
                  >
                    {product.stock > 0
                      ? `${product.stock} in Stock`
                      : "Out of Stock"}
                  </span>
                </td>
                <td className="py-3 px-6 text-center">
                  <div className="flex item-center justify-center gap-4">
                    <button className="text-blue-500 hover:text-blue-700 transform hover:scale-110 transition">
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-500 hover:text-red-700 transform hover:scale-110 transition"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State Message */}
        {filteredProducts.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {searchTerm || selectedCategory !== "all"
              ? "No products match your filters."
              : "No products found."}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
