import api from "./api";

// 🟢 FIX: Call the Backend Stats Endpoint directly
// Do not fetch "all orders" and calculate locally.
export const getDashboardStats = async (dateFilter = null) => {
  try {
    let query = "";
    
    // Construct Query Parameters if filters exist
    if (dateFilter && dateFilter.start && dateFilter.end) {
      query = `?start=${dateFilter.start}&end=${dateFilter.end}`;
    }

    // Call the new backend logic
    const response = await api.get(`/orders/admin/stats${query}`);
    
    // The backend now returns { totalSales, totalOrders, pendingOrders, todayOrders }
    // We might need to fetch users separately if not included in that endpoint
    const usersRes = await api.get("/auth/users");

    return {
      ...response.data,
      totalUsers: usersRes.data.length, 
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw error;
  }
};

// ... (Keep the rest of your file exactly the same)
export const getAllReturnRequests = async (page = 1, limit = 10) => {
  const response = await api.get(
    `/orders/admin/returns/all?page=${page}&limit=${limit}`
  );
  return response.data;
};

export const updateReturnStatus = async (orderId, itemId, status) => {
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
  const response = await api.post("/addresses/admin/add", addressData);
  return response.data;
};

export const createOrderOnBehalf = async (orderData) => {
  const response = await api.post("/orders/admin/create", orderData);
  return response.data;
};

export const getCancelledRefundOrders = async (page = 1, limit = 10) => {
  const response = await api.get(
    `/orders/admin/refunds/cancelled?page=${page}&limit=${limit}`
  );
  return response.data;
};


export const getAllOrders = async (page = 1, limit = 100) => {
  try {
    // This calls the controller function 'getAllOrdersAdmin' we saw earlier
    const response = await api.get("/orders/admin/all");
    return response.data;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return []; // Return empty array on failure to prevent crash
  }
};