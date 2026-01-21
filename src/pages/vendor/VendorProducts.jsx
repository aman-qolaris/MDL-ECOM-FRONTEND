import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  fetchVendorProducts,
  deleteProductThunk,
  updateProductThunk,
} from "../../store/thunks/productThunks";
import AdminTableSkeleton from "../../components/placeholders/AdminTableSkeleton";

// Components
import ProductHeader from "../../components/vendor/products/ProductHeader";
import ProductFilters from "../../components/vendor/products/ProductFilters";
import ProductTable from "../../components/vendor/products/ProductTable";
import DeleteProductModal from "../../components/vendor/products/DeleteProductModal";
import EditProductModal from "../../components/vendor/products/EditProductModal";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const VendorProducts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state) => state.products);

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
    images: [],
    previewUrl: [],
  });

  // 1. Fetch Data
  useEffect(() => {
    dispatch(fetchVendorProducts());

    // Fetch Categories for Filter
    const fetchCategories = async () => {
      try {
        await axios
          .get("http://localhost:5007/api/products/categories")
          .then((response) => {
            setAllCategories(response.data);
          });
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
      images: [],
      previewUrl: product.imageUrl,
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("price", editData.price);
    formData.append("stock", editData.stock);

    // 🔴 CHANGED: Loop through 'images' array and append with key "images"
    if (editData.images && editData.images.length > 0) {
      editData.images.forEach((file) => {
        formData.append("images", file); // Key MUST be "images" (plural)
      });
    }

    await dispatch(
      updateProductThunk({ id: editData.id, productData: formData })
    );
    setIsEditOpen(false);
    dispatch(fetchVendorProducts());
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Create previews for all selected files
      const newPreviews = files.map((file) => URL.createObjectURL(file));

      setEditData({
        ...editData,
        images: files, // Store array of files
        previewUrl: newPreviews, // Store array of preview URLs
      });
    }
  };

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen relative animate-fadeIn">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-purple-600 hover:border-purple-300 transition-all shadow-sm"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">My Products</h1>
      </div>
      {/* Header */}
      <ProductHeader />

      {/* Filters */}
      <ProductFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        stockFilter={stockFilter}
        setStockFilter={setStockFilter}
        allCategories={allCategories}
      />

      {/* Content */}
      {loading ? (
        <AdminTableSkeleton rows={5} columns={4} />
      ) : (
        <ProductTable
          items={filteredItems}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Delete Modal */}
      <DeleteProductModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        productName={productToDelete?.name}
      />

      {/* Edit Modal */}
      <EditProductModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        editData={editData}
        setEditData={setEditData}
        handleFileChange={handleFileChange}
      />
    </div>
  );
};

export default VendorProducts;
