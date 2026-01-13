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

const VendorProducts = () => {
  const dispatch = useDispatch();
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
    image: null,
    previewUrl: "",
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
