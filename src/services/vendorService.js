import api from "./api";
import axios from "axios";

// Helper to get headers safely (handles cases where interceptor might miss if strictly using axios directly)
const getAuthHeaders = () => {
  const token =
    localStorage.getItem("vendorToken") || localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

// --- EXISTING ADMIN FUNCTIONS ---
export const getAllVendors = async () => {
  const response = await api.get("/admin/vendors");
  return response.data;
};

export const approveVendor = async (vendorId) => {
  const response = await api.put(`/admin/vendors/${vendorId}/approve`);
  return response.data;
};

export const rejectVendor = async (vendorId) => {
  const response = await api.put(`/admin/vendors/${vendorId}/reject`);
  return response.data;
};

// --- NEW VENDOR DASHBOARD FUNCTIONS ---

export const getVendorDashboardStats = async () => {
  // Using direct URL structure matching your previous code
  // Note: Optimally, backend should have a single /stats endpoint
  try {
    const config = { headers: getAuthHeaders() };

    // Parallel Fetch
    const [ordersRes, productsRes] = await Promise.all([
      axios.get("http://localhost:5007/api/orders/vendor/orders", config),
      axios.get(
        "http://localhost:5007/api/products/vendor/my-products",
        config
      ),
    ]);

    const orders = ordersRes.data;
    const products = productsRes.data;

    // Calculations
    const totalSales = orders
      .filter((item) => item.status === "DELIVERED")
      .reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);

    const today = new Date().toISOString().split("T")[0];
    const todayOrders = orders.filter(
      (item) => item.createdAt && item.createdAt.startsWith(today)
    ).length;

    const pendingOrders = orders.filter((item) =>
      ["PENDING", "PROCESSING"].includes(item.status)
    ).length;

    return {
      totalSales,
      totalOrders: orders.length,
      productCount: products.length,
      todayOrders,
      pendingOrders,
    };
  } catch (error) {
    console.error("Error fetching vendor stats:", error);
    throw error;
  }
};
