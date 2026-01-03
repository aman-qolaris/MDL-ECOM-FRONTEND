import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  fetchVendorProducts,
  // 👇 FIX: Import the exact names from your thunk file
  deleteProductThunk,
  updateProductThunk,
} from "../../store/thunks/productThunks";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaTimes,
  FaCloudUploadAlt,
} from "react-icons/fa";

const VendorProducts = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.products);

  // --- LOCAL STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [stockFilter, setStockFilter] = useState("all");
  const [allCategories, setAllCategories] = useState([]);

  // --- MODAL STATES ---
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
    price: "",
    stock: "",
    image: null,
    previewUrl: "",
  });

  // 1. Fetch Vendor Products
  useEffect(() => {
    dispatch(fetchVendorProducts());
  }, [dispatch]);

  // 2. Fetch Master Categories (Via API Gateway Port 5007)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          JSON.parse(localStorage.getItem("userInfo") || "{}").token;
        const config = {
          headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        };

        // Ensure this hits port 5007 (Gateway)
        const response = await axios.get(
          "http://localhost:5007/api/products/categories",
          config
        );
        setAllCategories(response.data);
      } catch (err) {
        console.error(
          "Failed to load categories. Ensure Gateway is running on 5007.",
          err
        );
      }
    };
    fetchCategories();
  }, []);

  // --- DELETE HANDLERS ---
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      // 👇 FIX: Use the correct Thunk name
      await dispatch(deleteProductThunk(productToDelete.id));
      setIsDeleteOpen(false);
      setProductToDelete(null);
    }
  };

  // --- EDIT HANDLERS ---
  const handleEditClick = (product) => {
    // Populate form with current values
    setEditData({
      id: product.id,
      price: product.price,
      // Get stock from the detailed object or fallback
      stock: product.stockDetails?.total || product.stock || 0,
      image: null,
      previewUrl: product.imageUrl,
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("price", editData.price);
    formData.append("stock", editData.stock);
    if (editData.image) {
      formData.append("image", editData.image);
    }

    // 👇 FIX: Use the correct Thunk name
    await dispatch(
      updateProductThunk({ id: editData.id, productData: formData })
    );

    setIsEditOpen(false);
    // Optional: Refresh list if Redux state didn't update automatically
    dispatch(fetchVendorProducts());
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditData({
        ...editData,
        image: file,
        previewUrl: URL.createObjectURL(file),
      });
    }
  };

  // --- FILTERING LOGIC ---
  const filteredItems = items.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toString().includes(searchTerm);
    // Use optional chaining for Category name
    const matchesCategory =
      categoryFilter === "All Categories" ||
      product.Category?.name === categoryFilter;

    const stock = product.stockDetails || {};
    const availableVal = stock.available !== undefined ? stock.available : 0;

    let matchesStock = true;
    if (stockFilter === "out_of_stock") matchesStock = availableVal === 0;
    else if (stockFilter === "low_stock")
      matchesStock = availableVal > 0 && availableVal < 10;

    return matchesSearch && matchesCategory && matchesStock;
  });

  if (loading)
    return <div className="text-center py-10">Loading your products...</div>;
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Product Inventory
          </h2>
          <p className="text-sm text-gray-500">
            Manage your products and stock levels
          </p>
        </div>
        <Link
          to="/vendor/products/new"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-all whitespace-nowrap"
        >
          <FaPlus size={14} /> Add New Product
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All Categories">All Categories</option>
              {allCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <FaFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
          </div>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="border py-2 px-4 rounded-lg focus:outline-none focus:ring-2 cursor-pointer bg-white border-gray-300 text-gray-700"
          >
            <option value="all">Show All Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="low_stock">Low Stock (&lt; 10)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredItems.length === 0 ? (
        <div className="bg-white p-10 rounded-xl border border-gray-200 text-center shadow-sm">
          <p className="text-gray-500">No products found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-5 font-semibold text-gray-600 text-sm w-[25%]">
                  PRODUCT DETAILS
                </th>
                <th className="p-5 font-semibold text-gray-600 text-sm w-[10%]">
                  PRICE
                </th>
                <th className="p-5 font-semibold text-gray-600 text-sm w-[55%] text-center">
                  INVENTORY STATUS
                </th>
                <th className="p-5 font-semibold text-gray-600 text-sm w-[10%] text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((product) => {
                const stock = product.stockDetails || {};
                const totalVal = stock.total || 0;
                const placedVal = stock.reserved || 0;
                const availableVal =
                  stock.available !== undefined ? stock.available : 0;
                const warehouseVal = (stock.warehouse || []).reduce(
                  (acc, w) => acc + (w.quantity || 0),
                  0
                );

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="p-5 align-middle">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                          <img
                            src={
                              product.imageUrl ||
                              "https://via.placeholder.com/150"
                            }
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            ID: {product.id}
                          </p>
                          {product.Category && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full">
                              {product.Category.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-5 align-middle font-medium text-gray-700">
                      ₹{product.price}
                    </td>
                    <td className="p-5 align-middle">
                      <div className="grid grid-cols-4 gap-3">
                        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-100 border border-gray-200">
                          <span className="text-[10px] font-bold uppercase text-gray-500">
                            Total
                          </span>
                          <span className="text-lg font-extrabold text-gray-800">
                            {totalVal}
                          </span>
                        </div>
                        <div
                          className={`flex flex-col items-center justify-center p-2 rounded-lg border ${
                            availableVal > 0
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                          }`}
                        >
                          <span
                            className={`text-[10px] font-bold uppercase ${
                              availableVal > 0
                                ? "text-green-600"
                                : "text-red-500"
                            }`}
                          >
                            Available
                          </span>
                          <span
                            className={`text-lg font-extrabold ${
                              availableVal > 0
                                ? "text-green-700"
                                : "text-red-600"
                            }`}
                          >
                            {availableVal}
                          </span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-purple-50 border border-purple-200">
                          <span className="text-[10px] font-bold uppercase text-purple-600">
                            Warehouse
                          </span>
                          <span className="text-lg font-extrabold text-purple-800">
                            {warehouseVal}
                          </span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-orange-50 border border-orange-200">
                          <span className="text-[10px] font-bold uppercase text-orange-600">
                            Placed
                          </span>
                          <span className="text-lg font-extrabold text-orange-800">
                            {placedVal}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 align-middle text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-full transition-all"
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-all"
                          title="Delete"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Delete Product?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">
                "{productToDelete?.name}"
              </span>
              ?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT PRODUCT MODAL --- */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Edit Product</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              <div className="flex flex-col items-center mb-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 mb-3 relative">
                  <img
                    src={
                      editData.previewUrl || "https://via.placeholder.com/150"
                    }
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 flex items-center gap-2">
                  <FaCloudUploadAlt /> Change Image
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  required
                  value={editData.price}
                  onChange={(e) =>
                    setEditData({ ...editData, price: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Total Stock
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Adjusting total stock auto-updates availability.
                </p>
                <input
                  type="number"
                  required
                  value={editData.stock}
                  onChange={(e) =>
                    setEditData({ ...editData, stock: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProducts;
