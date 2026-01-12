import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  fetchVendorProducts,
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
  FaBoxOpen,
} from "react-icons/fa";
import AdminTableSkeleton from "../../components/placeholders/AdminTableSkeleton"; // Reusing the Admin skeleton

const VendorProducts = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.products);

  // Local State
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [stockFilter, setStockFilter] = useState("all");
  const [allCategories, setAllCategories] = useState([]);

  // Modal State
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

  // 1. Fetch Data
  useEffect(() => {
    dispatch(fetchVendorProducts());

    // Fetch Categories for Filter
    const fetchCategories = async () => {
      try {
        const token =
          localStorage.getItem("vendorToken") || localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5007/api/products/categories"
        );
        setAllCategories(response.data);
      } catch (err) {
        console.error("Failed to load categories.", err);
      }
    };
    fetchCategories();
  }, [dispatch]);

  // 2. Filter Logic (Memoized)
  const filteredItems = useMemo(() => {
    return items.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toString().includes(searchTerm);

      const matchesCategory =
        categoryFilter === "All Categories" ||
        product.Category?.name === categoryFilter;

      const availableVal = product.availableStock || 0;
      let matchesStock = true;
      if (stockFilter === "out_of_stock") matchesStock = availableVal <= 0;
      else if (stockFilter === "low_stock")
        matchesStock = availableVal > 0 && availableVal < 10;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [items, searchTerm, categoryFilter, stockFilter]);

  // --- Handlers ---
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      await dispatch(deleteProductThunk(productToDelete.id));
      setIsDeleteOpen(false);
      setProductToDelete(null);
    }
  };

  const handleEditClick = (product) => {
    setEditData({
      id: product.id,
      price: product.price,
      stock: product.totalStock || 0,
      image: null,
      previewUrl: product.imageUrl,
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("price", editData.price);
    formData.append("stock", editData.stock);
    if (editData.image) formData.append("image", editData.image);

    await dispatch(
      updateProductThunk({ id: editData.id, productData: formData })
    );
    setIsEditOpen(false);
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative animate-fadeIn">
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
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-all whitespace-nowrap active:scale-95"
        >
          <FaPlus size={14} /> Add New Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search product name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:border-blue-300 transition"
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
            className="border py-2 px-4 rounded-lg focus:outline-none focus:ring-2 cursor-pointer bg-white border-gray-300 text-gray-700 hover:border-blue-300 transition"
          >
            <option value="all">Show All Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="low_stock">Low Stock (&lt; 10)</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <AdminTableSkeleton rows={5} columns={4} />
      ) : filteredItems.length === 0 ? (
        <div className="bg-white p-16 rounded-xl border border-gray-200 text-center shadow-sm flex flex-col items-center">
          <FaBoxOpen className="text-gray-300 text-5xl mb-4" />
          <h3 className="text-lg font-medium text-gray-800">
            No products found
          </h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-5 font-semibold text-gray-600 text-sm w-[25%]">
                  PRODUCT
                </th>
                <th className="p-5 font-semibold text-gray-600 text-sm w-[15%]">
                  PRICE
                </th>
                <th className="p-5 font-semibold text-gray-600 text-sm w-[45%] text-center">
                  INVENTORY STATUS
                </th>
                <th className="p-5 font-semibold text-gray-600 text-sm w-[15%] text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((product) => {
                const totalVal = product.totalStock || 0;
                const availableVal = product.availableStock || 0;
                const warehouseVal = product.warehouseStock || 0;

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
                          <p className="font-bold text-gray-800 text-sm line-clamp-1">
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
                      <div className="flex items-center justify-center gap-4">
                        <div className="text-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
                          <span className="block text-[10px] font-bold text-gray-400 uppercase">
                            Total
                          </span>
                          <span className="font-bold text-gray-700">
                            {totalVal}
                          </span>
                        </div>
                        <div
                          className={`text-center px-4 py-2 rounded-lg border ${
                            availableVal > 0
                              ? "bg-green-50 border-green-100"
                              : "bg-red-50 border-red-100"
                          }`}
                        >
                          <span
                            className={`block text-[10px] font-bold uppercase ${
                              availableVal > 0
                                ? "text-green-600"
                                : "text-red-500"
                            }`}
                          >
                            Available
                          </span>
                          <span
                            className={`font-bold ${
                              availableVal > 0
                                ? "text-green-700"
                                : "text-red-600"
                            }`}
                          >
                            {availableVal}
                          </span>
                        </div>
                        <div className="text-center px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
                          <span className="block text-[10px] font-bold text-blue-400 uppercase">
                            Warehouse
                          </span>
                          <span className="font-bold text-blue-700">
                            {warehouseVal}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <FaTrash size={18} />
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

      {/* Delete Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full animate-fadeIn scale-100">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Delete Product?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">
                "{productToDelete?.name}"
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm font-medium transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (Keeping original structure but cleaned up) */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all animate-fadeIn">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Edit Product</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              <div className="flex flex-col items-center mb-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 mb-3 relative group">
                  <img
                    src={
                      editData.previewUrl || "https://via.placeholder.com/150"
                    }
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="cursor-pointer text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
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
                  className="flex-1 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-md transition"
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
