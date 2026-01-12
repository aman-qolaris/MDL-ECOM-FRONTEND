import api from "./api";

// Fetch Dashboard Stats (Aggregated on Client Side)
// Note: Ideally, the backend should provide a /stats endpoint.
// Since we are frontend-focused, we wrap the calculation here.
export const getDashboardStats = async () => {
  try {
    // Parallel fetching for performance
    const [ordersRes, usersRes] = await Promise.all([
      api.get("/orders/admin/all"),
      api.get("/auth/users"),
    ]);

    const orders = ordersRes.data;
    const users = usersRes.data;

    // --- Perform Calculations ---
    const totalSales = orders
      .filter((o) => o.status === "DELIVERED")
      .reduce((acc, o) => acc + (parseFloat(o.amount) || 0), 0);

    const today = new Date().toISOString().split("T")[0];
    const todayOrders = orders.filter(
      (o) => o.createdAt && o.createdAt.startsWith(today)
    ).length;

    const pendingOrders = orders.filter((o) =>
      ["PENDING", "PROCESSING"].includes(o.status)
    ).length;

    return {
      totalSales,
      totalOrders: orders.length,
      totalUsers: users.length,
      todayOrders,
      pendingOrders,
    };
  } catch (error) {
    console.error("Error calculating admin stats:", error);
    throw error;
  }
};
