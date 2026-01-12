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

    // --- SNAPSHOT METRICS (Usually kept absolute, but you can filter them too if preferred) ---
    // We will recalculate "Today" and "Pending" based on the FILTERED list
    // so they reflect the selected range (e.g. "Pending orders in this date range").

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
      totalUsers: users.length, // Users usually remain "All Time" count
      todayOrders,
      pendingOrders,
    };
  } catch (error) {
    console.error("Error calculating admin stats:", error);
    throw error;
  }
};
