import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getProducts, updateProduct } from "../../services/productService";
import { getAllVendors } from "../../services/vendorService";
import { FaEdit, FaSearch, FaArrowLeft, FaFilter } from "react-icons/fa";

const AdminProducts = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Vendor Lookup State
  const [vendorMap, setVendorMap] = useState({});
  const [currentVendorName, setCurrentVendorName] = useState("");

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showOutOfStockOnly, setShowOutOfStockOnly] = useState(false);

  // Warehouse Stock Modal State
  const [editingStockId, setEditingStockId] = useState(null);
  const [newWarehouseStock, setNewWarehouseStock] = useState(0);

  useEffect(() => {
    loadData();
  }, [vendorId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch Products and Vendors in parallel
      const [productsData, vendorsData] = await Promise.all([
        getProducts(),
        getAllVendors(),
      ]);

      // Create Vendor Lookup Map (ID -> Name)
      const lookup = {};
      vendorsData.forEach((vendor) => {
        lookup[vendor.id] = vendor.businessName;
      });
      setVendorMap(lookup);

      // Filter by Vendor ID if present in URL
      if (vendorId) {
        const id = parseInt(vendorId);
        const filtered = productsData.filter((p) => p.vendorId === id);
        setProducts(filtered);

        if (lookup[id]) setCurrentVendorName(lookup[id]);
      } else {
        setProducts(productsData);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Warehouse Stock Update
  const handleUpdateWarehouseStock = async () => {
    if (!editingStockId) return;

    try {
      // API Call to update only the warehouseStock field
      await updateProduct(editingStockId, {
        warehouseStock: parseInt(newWarehouseStock),
      });

      // Optimistic UI Update (Update local state without refreshing)
      setProducts(
        products.map((p) =>
          p.id === editingStockId
            ? { ...p, warehouseStock: parseInt(newWarehouseStock) }
            : p
        )
      );

      setEditingStockId(null);
    } catch (error) {
      alert("Failed to update warehouse stock");
    }
  };

  const openStockModal = (product) => {
    setEditingStockId(product.id);
    setNewWarehouseStock(product.warehouseStock || 0);
  };

  // Filter Logic
  const filteredProducts = products.filter((product) => {
    // 1. Search Name
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // 2. Filter Category
    const categoryName =
      product.Category?.name || product.category || "Uncategorized";
    const matchesCategory =
      selectedCategory === "all" || categoryName === selectedCategory;

    // 3. Filter Stock (Based on Available Stock)
    const availableStock = (product.stock || 0) - (product.reservedStock || 0);
    const matchesStock = showOutOfStockOnly ? availableStock <= 0 : true;

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Get unique categories for dropdown
  const categories = [
    "all",
    ...new Set(
      products.map((p) => p.Category?.name || p.category || "Uncategorized")
    ),
  ];

  if (loading) return <div className="p-6">Loading inventory...</div>;

  return (
    <div className="animate-fadeIn relative">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/inventory")}
            className="p-2 rounded-full hover:bg-gray-200 transition"
            title="Back to Vendors"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>

          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {currentVendorName
                ? `${currentVendorName}'s Inventory`
                : "All Inventory"}
            </h2>
            <p className="text-sm text-gray-500">
              Manage Vendor & Warehouse Stock
            </p>
          </div>
        </div>
        {/* No Add Product Button for Admin */}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
        {/* Search */}
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

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6">Product</th>
              <th className="py-3 px-6 text-center">Total (Vendor)</th>
              <th className="py-3 px-6 text-center">Reserved</th>
              <th className="py-3 px-6 text-center">Available</th>
              <th className="py-3 px-6 text-center bg-blue-50 text-blue-700 border-b border-blue-100">
                Warehouse
              </th>
              <th className="py-3 px-6 text-center">Status</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {filteredProducts.map((product) => {
              // Calculate Stocks
              const total = product.stock || 0;
              const reserved = product.reservedStock || 0;
              const available = total - reserved;
              const warehouse = product.warehouseStock || 0;
              const isOutOfStock = available <= 0;

              return (
                <tr
                  key={product.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-6 flex items-center gap-3">
                    <img
                      src={
                        product.imageUrl || "https://via.placeholder.com/150"
                      }
                      alt=""
                      className="w-10 h-10 object-contain rounded border border-gray-200 mix-blend-multiply"
                    />
                    <span className="font-medium text-gray-800">
                      {product.name}
                    </span>
                  </td>

                  {/* Total Stock */}
                  <td className="py-3 px-6 text-center font-semibold text-gray-700">
                    {total}
                  </td>

                  {/* Reserved Stock */}
                  <td className="py-3 px-6 text-center text-orange-600 font-medium">
                    {reserved}
                  </td>

                  {/* Available Stock */}
                  <td className="py-3 px-6 text-center">
                    <span
                      className={`font-bold ${
                        isOutOfStock ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {available}
                    </span>
                  </td>

                  {/* Warehouse Stock (Editable) */}
                  <td className="py-3 px-6 text-center bg-blue-50/50">
                    <span className="text-blue-800 font-bold">{warehouse}</span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-6 text-center">
                    {isOutOfStock ? (
                      <span className="bg-red-100 text-red-700 py-1 px-3 rounded-full text-xs font-bold">
                        Out of Stock
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-700 py-1 px-3 rounded-full text-xs font-bold">
                        In Stock
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => openStockModal(product)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mx-auto transition bg-white border border-blue-200 px-3 py-1 rounded-md shadow-sm hover:shadow"
                      title="Edit Warehouse Stock"
                    >
                      <FaEdit />{" "}
                      <span className="text-xs font-bold">Warehouse</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No products found matching your filters.
          </div>
        )}
      </div>

      {/* Warehouse Stock Modal */}
      {editingStockId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-96 animate-fadeIn transform transition-all scale-100">
            <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
              Update Warehouse Stock
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Enter the physical quantity stored in the Admin Warehouse.
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              value={newWarehouseStock}
              onChange={(e) => setNewWarehouseStock(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-lg mb-6 focus:ring-2 focus:ring-blue-500 outline-none transition"
              min="0"
              autoFocus
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditingStockId(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateWarehouseStock}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md hover:shadow-lg"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
