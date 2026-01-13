import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { getAllVendors } from "../../services/vendorService";

// Components
import InventoryHeader from "../../components/admin/inventory/vendor/InventoryHeader";
import InventoryFilters from "../../components/admin/inventory/vendor/InventoryFilters";
import InventoryTable from "../../components/admin/inventory/vendor/InventoryTable";
import StockUpdateModal from "../../components/admin/inventory/vendor/StockUpdateModal";

const AdminVendorInventory = () => {
  const { vendorId } = useParams();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("token") ||
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
    const totalStock = editingProduct.totalStock || 0;
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
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("adminToken") ||
        JSON.parse(localStorage.getItem("userInfo") || "{}").token;

      // 2. Call API (Using the specific Admin Warehouse Update endpoint)
      const response = await axios.put(
        `http://localhost:5007/api/products/admin/inventory/update`,
        {
          productId: editingProduct.id,
          warehouseStock: warehouseVal,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 3. Optimistic Update
      const updatedData = response.data.product || response.data;

      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...p, warehouseStock: updatedData.warehouseStock }
            : p
        )
      );

      closeModal();
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || "Failed to update stock.");
    }
  };

  const openStockModal = (product) => {
    setEditingProduct(product);
    const currentWarehouse = product.warehouseStock || 0;
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
      <InventoryHeader vendorName={currentVendorName} />

      <InventoryFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        showOutOfStockOnly={showOutOfStockOnly}
        setShowOutOfStockOnly={setShowOutOfStockOnly}
        categories={categories}
      />

      <InventoryTable products={filteredProducts} onEdit={openStockModal} />

      <StockUpdateModal
        editingProduct={editingProduct}
        newWarehouseStock={newWarehouseStock}
        setNewWarehouseStock={setNewWarehouseStock}
        errorMsg={errorMsg}
        setErrorMsg={setErrorMsg}
        onClose={closeModal}
        onSave={handleUpdateWarehouse}
      />
    </div>
  );
};

export default AdminVendorInventory;
