import api from "./api";
import axios from "axios"; // Import axios directly for manual token handling

// Helper for Base URL (Matches your api.js config)
const BASE_URL = "http://localhost:5007/api";

// ==================================================
// 🛍️ CUSTOMER ROUTES
// ==================================================

// 1. CREATE ORDER (Checkout)
export const createOrder = async (orderData) => {
  const response = await api.post("/orders/checkout", orderData);
  return response.data;
};

// 2. GET MY ORDERS (Customer Profile)
export const getMyOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

// 3. GET SINGLE ORDER DETAILS
export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

// ==================================================
// 🏢 VENDOR ROUTES (Fixes 401 Error)
// ==================================================

// 4. Get Vendor's Items to Fulfill
export const getVendorOrders = async () => {
  const token = localStorage.getItem("vendorToken");

  if (!token) {
    console.error("No vendor token found in localStorage");
    return [];
  }

  // We use direct 'axios' here to force the Vendor Token
  const response = await axios.get(`${BASE_URL}/orders/vendor`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// 5. Update Item Status (e.g., Vendor marks as "PACKED")
export const updateVendorItemStatus = async (itemId, status) => {
  const token = localStorage.getItem("vendorToken");

  const response = await axios.put(
    `${BASE_URL}/orders/item/${itemId}`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// ==================================================
// 🛡️ ADMIN ROUTES
// ==================================================

// 6. GET ALL ORDERS (Admin)
export const getAllOrders = async () => {
  const response = await api.get("/orders/admin/all");
  return response.data;
};

// 7. UPDATE ORDER STATUS (Admin: Shipped/Delivered)
export const updateOrderStatus = async (orderId, status) => {
  const response = await api.put(`/orders/admin/${orderId}/status`, { status });
  return response.data;
};
