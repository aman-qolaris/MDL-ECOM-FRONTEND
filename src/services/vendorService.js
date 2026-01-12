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

// Helper to check if a date is within range
const isWithinRange = (dateString, start, end) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);

  return date >= startDate && date <= endDate;
};

// --- UPDATED VENDOR DASHBOARD FUNCTION ---
export const getVendorDashboardStats = async (dateFilter = null) => {
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

    let orders = ordersRes.data;
    const products = productsRes.data;

    // --- APPLY DATE FILTER IF PROVIDED ---
    if (dateFilter && dateFilter.start && dateFilter.end) {
      orders = orders.filter((item) =>
        isWithinRange(item.createdAt, dateFilter.start, dateFilter.end)
      );
    }

    // Calculations (on potentially filtered orders)
    const totalSales = orders
      .filter((item) => item.status === "DELIVERED")
      .reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);

    // Recalculate specific "Today" metrics based on the filtered set
    // (Or keep absolute "Today" if you prefer. Usually "Today" changes to "Today within filtered range" which is just the filtered range itself, but for specific "Today" stats inside a range view, we often just count the filtered list)

    // Logic: If filtering by range, "todayOrders" usually just means "orders in this view" or strictly "today".
    // To match the Admin Dashboard pattern, we usually recalculate "Today" strictly from current date,
    // BUT since we filtered the main list 'orders' above, if the range excludes today, this will be 0.
    const todayStr = new Date().toISOString().split("T")[0];
    const todayOrders = orders.filter(
      (item) => item.createdAt && item.createdAt.startsWith(todayStr)
    ).length;

    const pendingOrders = orders.filter((item) =>
      ["PENDING", "PROCESSING"].includes(item.status)
    ).length;

    return {
      totalSales,
      totalOrders: orders.length,
      productCount: products.length, // Inventory count usually remains global
      todayOrders,
      pendingOrders,
    };
  } catch (error) {
    console.error("Error fetching vendor stats:", error);
    throw error;
  }
};
