import api from "./api";

// Helper to check if a date is within range
const isWithinRange = (dateString, start, end) => {
  const date = new Date(dateString);
  // Set times to ensure inclusive comparison
  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);

  return date >= startDate && date <= endDate;
};

// Modified to accept optional filters { start, end }
export const getDashboardStats = async (dateFilter = null) => {
  try {
    // Parallel fetching
    const [ordersRes, usersRes] = await Promise.all([
      api.get("/orders/admin/all"),
      api.get("/auth/users"),
    ]);

    let orders = ordersRes.data;
    const users = usersRes.data;

    // --- APPLY DATE FILTER IF PROVIDED ---
    if (dateFilter && dateFilter.start && dateFilter.end) {
      orders = orders.filter((o) =>
        isWithinRange(o.createdAt, dateFilter.start, dateFilter.end)
      );
    }

    // --- Perform Calculations on (potentially filtered) orders ---

    // Total Sales (Based on filtered orders)
    const totalSales = orders
      .filter((o) => o.status === "DELIVERED")
      .reduce((acc, o) => acc + (parseFloat(o.amount) || 0), 0);

    // Total Orders (Based on filtered orders)
    const totalOrders = orders.length;

    // --- SNAPSHOT METRICS ---
    const todayStr = new Date().toISOString().split("T")[0];

    const todayOrders = orders.filter(
      (o) => o.createdAt && o.createdAt.startsWith(todayStr)
    ).length;

    const pendingOrders = orders.filter((o) =>
      ["PENDING", "PROCESSING"].includes(o.status)
    ).length;

    return {
      totalSales,
      totalOrders,
      totalUsers: users.length,
      todayOrders,
      pendingOrders,
    };
  } catch (error) {
    console.error("Error calculating admin stats:", error);
    throw error;
  }
};

// ✅ Fetch all return requests
export const getAllReturnRequests = async () => {
  // Matches: app.get("/api/orders/admin/returns/all")
  const response = await api.get("/orders/admin/returns/all");
  return response.data;
};

// ✅ Update status (Approve, Reject, Refunded)
export const updateReturnStatus = async (orderId, itemId, status) => {
  // Matches: app.put("/api/orders/admin/:orderId/items/:itemId/return-status")
  const response = await api.put(
    `/orders/admin/${orderId}/items/${itemId}/return-status`,
    { status }
  );
  return response.data;
};

export const searchUserByPhone = async (phone) => {
  const response = await api.get(`/admin/users/search?phone=${phone}`);
  return response.data;
};

export const registerUserOnBehalf = async (userData) => {
  const response = await api.post("/admin/users/register", userData);
  return response.data;
};

export const addUserAddressOnBehalf = async (addressData) => {
  const response = await api.post("/admin/users/address", addressData);
  return response.data;
};

export const createOrderOnBehalf = async (orderData) => {
  const response = await api.post("/orders/admin/create", orderData);
  return response.data;
};
