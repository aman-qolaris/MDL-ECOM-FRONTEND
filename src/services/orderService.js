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
export const getMyOrders = async (page = 1, limit = 10) => {
  // Pass page and limit as query parameters
  const response = await api.get(`/orders?page=${page}&limit=${limit}`);
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
  const token = localStorage.getItem("vendorToken"); // ✅ Only check vendorToken
  if (!token) {
    throw new Error("Please log in as a vendor");
  }

  try {
    const response = await axios.get(`${BASE_URL}/orders/vendor/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 5. Update Item Status
export const updateVendorItemStatus = async (itemId, status) => {
  const token = localStorage.getItem("vendorToken");
  // Update URL to match the new Gateway route
  const response = await axios.put(
    `${BASE_URL}/orders/vendor/item/${itemId}/status`,
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

// 👇 ADD THIS: Fetch all vendors (to get shop names)
export const getAllVendors = async () => {
  const response = await api.get("/admin/vendors");
  return response.data;
};

// 7. UPDATE ORDER STATUS (Admin: Shipped/Delivered)
export const updateOrderStatus = async (orderId, status) => {
  const response = await api.put(`/orders/admin/${orderId}/status`, { status });
  return response.data;
};

// 8. GET ADMIN SPECIFIC ORDER DETAILS (Includes Delivery Info)
export const getAdminOrderDetails = async (orderId) => {
  const response = await api.get(`/orders/admin/${orderId}`);
  return response.data;
};

// 9. UPDATE ORDER ITEM STATUS (Admin: Ready/Packed)
// ✅ FIX: Changed URL from /orders/items/ to /orders/admin/item/
export const updateOrderItemStatus = async (orderId, itemId, status) => {
  // Matches Gateway Route: /api/orders/admin/:orderId/item/:itemId/status
  const response = await api.put(
    `/orders/admin/${orderId}/item/${itemId}/status`,
    { status }
  );
  return response.data;
};

// ==================================================
// 🚚 DELIVERY BOY ROUTES
// ==================================================

// 10. Fetch all delivery boys
export const getAllDeliveryBoys = async () => {
  const response = await api.get("/orders/admin/delivery-boys");
  return response.data;
};

export const addDeliveryBoy = async (data) => {
  const response = await api.post("/orders/admin/delivery-boys", data);
  return response.data;
};

export const deleteDeliveryBoy = async (id) => {
  const response = await api.delete(`/orders/admin/delivery-boys/${id}`);
  return response.data;
};

// src/services/orderService.js
export const updateDeliveryBoy = async (id, data) => {
  // Matches api-gateway route
  const response = await api.put(`/orders/admin/delivery-boys/${id}`, data);
  return response.data;
};

// 11. Assign a delivery boy to an order
// In assignDeliveryBoy function
export const assignDeliveryBoy = async (orderId, deliveryBoyId) => {
  // Update the URL to match Gateway
  const response = await api.post(`/orders/admin/assign-delivery/${orderId}`, {
    deliveryBoyId,
  });
  return response.data;
};

// 12. Reassign a delivery boy (when one is already assigned but needs changing)
export const reassignDeliveryBoy = async (
  orderId,
  oldDeliveryBoyId,
  newDeliveryBoyId,
  reason
) => {
  const response = await api.put(`/orders/${orderId}/reassign`, {
    oldDeliveryBoyId,
    newDeliveryBoyId,
    reason,
  });
  return response.data;
};

export const getAdminVendorSales = async (vendorId, type = "monthly") => {
  const response = await api.get(`/orders/admin/sales/vendor/${vendorId}`, {
    params: { type },
  });
  return response.data;
};

// 13. Get Delivery Locations (For Checkout Dropdown)
export const getDeliveryLocations = async () => {
  const response = await api.get("/orders/locations");
  return response.data;
};

// ==================================================
// 💰 COD RECONCILIATION ROUTES
// ==================================================

// 1. Get Overview (Who owes what?)
export const getCODReconciliation = async () => {
  const response = await api.get("/orders/admin/reconciliation/cod");
  return response.data;
};

// 2. Settle Cash (Mark specific orders as deposited)
export const settleCOD = async (deliveryBoyId, orderIds) => {
  const response = await api.post("/orders/admin/reconciliation/settle", {
    deliveryBoyId,
    orderIds,
  });
  return response.data;
};
