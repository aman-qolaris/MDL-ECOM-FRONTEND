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
// ==================================================
// 🏢 VENDOR ROUTES
// ==================================================

// 4. Get Vendor's Items (Existing)
export const getVendorOrders = async () => {
  const token = localStorage.getItem("vendorToken");
  if (!token) return [];
  const response = await axios.get(`${BASE_URL}/orders/vendor`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// [NEW] Get Specific Order Details for Vendor
export const getVendorOrderDetails = async (orderId) => {
  const token = localStorage.getItem("vendorToken");
  // Assuming backend exposes this endpoint for vendors
  const response = await axios.get(`${BASE_URL}/orders/vendor/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// [NEW] Get Delivery Boys for Vendor (to assign)
export const getVendorDeliveryBoys = async () => {
  const token = localStorage.getItem("vendorToken");
  // Reusing the admin endpoint, assuming Vendors have permission to view drivers
  const response = await axios.get(`${BASE_URL}/orders/admin/delivery-boys`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// 5. Update Item Status (Existing)
export const updateVendorItemStatus = async (itemId, status) => {
  const token = localStorage.getItem("vendorToken");
  const response = await axios.put(
    `${BASE_URL}/orders/item/${itemId}`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// [NEW] Vendor Assigns Delivery Boy
export const vendorAssignDeliveryBoy = async (orderId, deliveryBoyId) => {
  const token = localStorage.getItem("vendorToken");
  const response = await axios.post(
    `${BASE_URL}/orders/${orderId}/assign`,
    { deliveryBoyId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// [NEW] Vendor Updates Order Status (e.g. Out for Delivery)
export const vendorUpdateOrderStatus = async (orderId, status) => {
  const token = localStorage.getItem("vendorToken");
  const response = await axios.put(
    `${BASE_URL}/orders/admin/${orderId}/status`, // Using admin endpoint logic
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
export const updateOrderItemStatus = async (itemId, status) => {
  const response = await api.put(`/orders/admin/item/${itemId}`, { status });
  return response.data;
};

// ==================================================
// 🚚 DELIVERY BOY ROUTES
// ==================================================

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
export const assignDeliveryBoy = async (orderId, deliveryBoyId) => {
  const response = await api.post(`/orders/${orderId}/assign`, {
    deliveryBoyId,
  });
  return response.data;
};
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
