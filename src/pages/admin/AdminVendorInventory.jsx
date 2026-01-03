import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getAllVendors } from "../../services/vendorService";
import { updateProduct } from "../../services/productService";
import {
  FaEdit,
  FaSearch,
  FaArrowLeft,
  FaFilter,
  FaBoxOpen,
} from "react-icons/fa";

const AdminVendorInventory = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Vendor Lookup State
  const [currentVendorName, setCurrentVendorName] = useState("");

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showOutOfStockOnly, setShowOutOfStockOnly] = useState(false);

  // Stock Update Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [newWarehouseStock, setNewWarehouseStock] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadData();
  }, [vendorId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("adminToken") ||
        JSON.parse(localStorage.getItem("userInfo") || "{}").token;

      // 1. Fetch Vendors (to get the name)
      const vendorsData = await getAllVendors();
      const vendor = vendorsData.find((v) => v.id.toString() === vendorId);
      if (vendor) setCurrentVendorName(vendor.businessName);

      // 2. Fetch Products for THIS Vendor Only
      const response = await axios.get(
        `http://localhost:5007/api/products/vendor/${vendorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLE WAREHOUSE UPDATE ---
  const handleUpdateWarehouse = async () => {
    if (!editingProduct) return;

    // 1. Validation: Warehouse cannot exceed Total
    const totalStock = editingProduct.vendortotalstock || 0;
    const warehouseVal = parseInt(newWarehouseStock);

    if (warehouseVal < 0) {
      setErrorMsg("Stock cannot be negative.");
      return;
    }
    if (warehouseVal > totalStock) {
      setErrorMsg(
        `Warehouse stock (${warehouseVal}) cannot exceed Total Stock (${totalStock}).`
      );
      return;
    }

    try {
      // 2. Call API
      // Note: Ensure your backend 'updateProduct' controller handles "warehouseStock" in req.body
      // and updates the logic accordingly.
      const response = await updateProduct(editingProduct.id, {
        warehouseStock: warehouseVal,
      });

      // 3. Optimistic Update
      // We assume backend returns the updated product structure
      const updatedData = response.product || response;

      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id ? { ...p, ...updatedData } : p
        )
      );

      closeModal();
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to update stock. Please try again.");
    }
  };

  const openStockModal = (product) => {
    setEditingProduct(product);

    // Calculate current warehouse stock from the array/object
    const stock = product.stockDetails || {};
    const currentWarehouse = (stock.warehouse || []).reduce(
      (acc, w) => acc + (w.quantity || 0),
      0
    );

    setNewWarehouseStock(currentWarehouse);
    setErrorMsg("");
  };

  const closeModal = () => {
    setEditingProduct(null);
    setNewWarehouseStock(0);
    setErrorMsg("");
  };

  // --- FILTERS ---
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const categoryName =
      product.Category?.name || product.category || "Uncategorized";
    const matchesCategory =
      selectedCategory === "all" || categoryName === selectedCategory;

    const available = product.availableStock || 0;
    const matchesStock = showOutOfStockOnly ? available <= 0 : true;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const categories = [
    "all",
    ...new Set(
      products.map((p) => p.Category?.name || p.category || "Uncategorized")
    ),
  ];

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">Loading inventory...</div>
    );

  return (
    <div className="animate-fadeIn relative p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/inventory")}
            className="p-2 rounded-full hover:bg-gray-200 transition text-gray-600"
            title="Back to Vendors"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaBoxOpen className="text-blue-600" />
              {currentVendorName
                ? `${currentVendorName}'s Inventory`
                : "Vendor Inventory"}
            </h2>
            <p className="text-sm text-gray-500">Manage Warehouse Allocation</p>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
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

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 w-[30%]">Product</th>
              <th className="py-3 px-6 w-[10%]">Price</th>
              <th className="py-3 px-6 w-[50%] text-center">Stock Breakdown</th>
              <th className="py-3 px-6 w-[10%] text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {filteredProducts.map((product) => {
              // --- STOCK CALCULATIONS ---
              const stock = product.stockDetails || {};
              const totalVal = stock.total || product.vendortotalstock || 0;
              const availableVal =
                stock.available !== undefined
                  ? stock.available
                  : product.availableStock || 0;

              // Warehouse is sum of quantities
              const warehouseVal = (stock.warehouse || []).reduce(
                (acc, w) => acc + (w.quantity || 0),
                0
              );

              // Placed/Reserved
              const placedVal = stock.reserved || 0;

              return (
                <tr
                  key={product.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0">
                        <img
                          src={
                            product.imageUrl ||
                            "https://via.placeholder.com/150"
                          }
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">
                          {product.name}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          ID: {product.id}
                        </span>
                        {product.Category && (
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1 rounded w-fit mt-0.5">
                            {product.Category.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-6 font-medium">₹{product.price}</td>

                  {/* 4-BOX STOCK GRID */}
                  <td className="py-3 px-6">
                    <div className="grid grid-cols-4 gap-2">
                      {/* TOTAL */}
                      <div className="flex flex-col items-center justify-center p-1.5 rounded bg-gray-100 border border-gray-200">
                        <span className="text-[9px] font-bold uppercase text-gray-500">
                          Total
                        </span>
                        <span className="text-sm font-extrabold text-gray-800">
                          {totalVal}
                        </span>
                      </div>

                      {/* AVAILABLE */}
                      <div
                        className={`flex flex-col items-center justify-center p-1.5 rounded border ${
                          availableVal > 0
                            ? "bg-green-50 border-green-200"
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        <span
                          className={`text-[9px] font-bold uppercase ${
                            availableVal > 0 ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          Avail
                        </span>
                        <span
                          className={`text-sm font-extrabold ${
                            availableVal > 0 ? "text-green-700" : "text-red-600"
                          }`}
                        >
                          {availableVal}
                        </span>
                      </div>

                      {/* WAREHOUSE */}
                      <div className="flex flex-col items-center justify-center p-1.5 rounded bg-purple-50 border border-purple-200">
                        <span className="text-[9px] font-bold uppercase text-purple-600">
                          Ware
                        </span>
                        <span className="text-sm font-extrabold text-purple-800">
                          {warehouseVal}
                        </span>
                      </div>

                      {/* PLACED */}
                      <div className="flex flex-col items-center justify-center p-1.5 rounded bg-orange-50 border border-orange-200">
                        <span className="text-[9px] font-bold uppercase text-orange-600">
                          Placed
                        </span>
                        <span className="text-sm font-extrabold text-orange-800">
                          {placedVal}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => openStockModal(product)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mx-auto transition bg-white border border-blue-200 px-3 py-1.5 rounded-md shadow-sm hover:shadow"
                      title="Update Warehouse Stock"
                    >
                      <FaEdit /> <span className="text-xs font-bold">Edit</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No products found.
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-96 animate-fadeIn">
            <h3 className="text-xl font-bold mb-2 text-gray-800 border-b pb-2">
              Update Warehouse Stock
            </h3>

            <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p className="flex justify-between mb-1">
                <span>Vendor Total Stock:</span>
                <span className="font-bold">
                  {editingProduct.vendortotalstock || 0}
                </span>
              </p>
              <p className="flex justify-between">
                <span>Current Warehouse:</span>
                <span className="font-bold text-purple-700">
                  {(editingProduct.stockDetails?.warehouse || []).reduce(
                    (acc, w) => acc + (w.quantity || 0),
                    0
                  )}
                </span>
              </p>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Warehouse Quantity
            </label>
            <input
              type="number"
              value={newWarehouseStock}
              onChange={(e) => {
                setNewWarehouseStock(e.target.value);
                setErrorMsg(""); // Clear error on change
              }}
              className={`w-full border p-2 rounded-lg mb-2 focus:ring-2 outline-none transition ${
                errorMsg
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              min="0"
              autoFocus
            />

            {errorMsg && (
              <p className="text-xs text-red-600 font-medium mb-4">
                {errorMsg}
              </p>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateWarehouse}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md"
              >
                Save Updates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendorInventory;
