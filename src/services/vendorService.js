import api from "./api"; // 🟢 Only import your custom API instance

// --- ADMIN FUNCTIONS ---
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

// --- HELPER: Date Range Check ---
const isWithinRange = (dateString, start, end) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);

  return date >= startDate && date <= endDate;
};

// --- VENDOR DASHBOARD STATS ---
export const getVendorDashboardStats = async (dateFilter = null) => {
  try {
    // 🟢 REPLACED direct axios calls with api.get()
    // The interceptor in api.js will automatically attach the Vendor Token
    // and use the correct Base URL.
    const [ordersRes, productsRes] = await Promise.all([
      api.get("/orders/vendor/orders"),
      api.get("/products/vendor/my-products"),
    ]);

    let orders = ordersRes.data;
    const products = productsRes.data;

    // --- APPLY DATE FILTER IF PROVIDED ---
    if (dateFilter && dateFilter.start && dateFilter.end) {
      orders = orders.filter((item) =>
        isWithinRange(item.createdAt, dateFilter.start, dateFilter.end)
      );
    }

    // 🟢 Robust Total Sales Calculation (Excludes Returns)
    const totalSales = orders
      .filter((item) => {
        const status = item.status?.toUpperCase() || "";
        const returnStatus = item.returnStatus?.toUpperCase() || "NONE";

        // Only count if DELIVERED and NOT returned/refunded
        return (
          status === "DELIVERED" &&
          ["NONE", "REQUESTED", "APPROVED", "PICKUP_SCHEDULED"].includes(
            returnStatus
          )
        );
      })
      .reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);

    // Today's Orders
    const todayStr = new Date().toISOString().split("T")[0];
    const todayOrders = orders.filter(
      (item) => item.createdAt && item.createdAt.startsWith(todayStr)
    ).length;

    // Pending Orders
    const pendingOrders = orders.filter((item) =>
      ["PENDING", "PROCESSING"].includes(item.status?.toUpperCase())
    ).length;

    // Active Returns Count
    const returnsCount = orders.filter(
      (item) => item.returnStatus && item.returnStatus !== "NONE"
    ).length;

    return {
      totalSales,
      totalOrders: orders.length,
      productCount: products.length,
      todayOrders,
      pendingOrders,
      returnsCount,
    };
  } catch (error) {
    console.error("Error fetching vendor stats:", error);
    throw error;
  }
};
