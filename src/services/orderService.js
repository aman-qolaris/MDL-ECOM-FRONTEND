import api from "./api";
import axios from "axios";

const BASE_URL = "http://localhost:5007/api";

// ==================================================
// 🛍️ CUSTOMER
// ==================================================

// 🟢 NEW: Fetch dynamic shipping rate
export const getShippingRateForArea = async (areaName) => {
  try {
    // Calls the backend route we just created
    const { data } = await api.get(
      `/orders/shipping/calculate?area=${encodeURIComponent(areaName)}`
    );
    return data.rate;
  } catch (error) {
    console.error("Shipping Rate Error:", error);
    return 0; // Default to 0 if api fails
  }
};

export const createOrder = async (orderData) => {
  const response = await api.post("/orders/checkout", orderData);
  return response.data;
};

export const getMyOrders = async (page = 1, limit = 10) => {
  const response = await api.get(`/orders?page=${page}&limit=${limit}`);
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

// 🟢 FIXED: Added 'reason' as the 3rd argument
export const cancelOrderItem = async (orderId, itemId, reason) => {
  const response = await api.put(`/orders/${orderId}/cancel-item/${itemId}`, {
    reason, // Now this works because 'reason' is passed in
  });
  return response.data;
};

// 🟢 FIXED: Added 'reason' as the 2nd argument
export const cancelOrder = async (orderId, reason) => {
  const response = await api.put(`/orders/${orderId}/cancel`, {
    reason, // Now this works because 'reason' is passed in
  });
  return response.data;
};

export const requestReturn = async (orderId, itemId, data) => {
  const response = await api.post(
    `/orders/${orderId}/items/${itemId}/return`,
    data
  );
  return response.data;
};

export const getDeliveryLocations = async () => {
  const response = await api.get("/orders/locations");
  return response.data;
};

// ==================================================
// 🏢 VENDOR
// ==================================================

export const getVendorOrders = async () => {
  const token = localStorage.getItem("vendorToken");
  if (!token) {
    throw new Error("Please log in as a vendor");
  }

  const response = await axios.get(`${BASE_URL}/orders/vendor/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateVendorItemStatus = async (itemId, status) => {
  const token = localStorage.getItem("vendorToken");

  const response = await axios.put(
    `${BASE_URL}/orders/vendor/item/${itemId}/status`,
    { status },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

// ==================================================
// 🛡️ ADMIN
// ==================================================

export const getAllOrders = async () => {
  const response = await api.get("/orders/admin/all");
  return response.data;
};

export const getAdminOrderDetails = async (orderId) => {
  const response = await api.get(`/orders/admin/${orderId}`);
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await api.put(`/orders/admin/${orderId}/status`, { status });
  return response.data;
};

export const updateOrderItemStatus = async (orderId, itemId, status) => {
  const response = await api.put(
    `/orders/admin/${orderId}/item/${itemId}/status`,
    { status }
  );
  return response.data;
};

export const getAllVendors = async () => {
  const response = await api.get("/admin/vendors");
  return response.data;
};

export const getAdminVendorSales = async (vendorId, type = "monthly") => {
  const response = await api.get(`/orders/admin/sales/vendor/${vendorId}`, {
    params: { type },
  });
  return response.data;
};

// ==================================================
// 🚚 DELIVERY BOY (ADMIN)
// ==================================================

export const getAllDeliveryBoys = async () => {
  const response = await api.get("/orders/admin/delivery-boys");
  return response.data;
};

export const addDeliveryBoy = async (data) => {
  const response = await api.post("/orders/admin/delivery-boys", data);
  return response.data;
};

export const updateDeliveryBoy = async (id, data) => {
  const response = await api.put(`/orders/admin/delivery-boys/${id}`, data);
  return response.data;
};

export const deleteDeliveryBoy = async (id) => {
  const response = await api.delete(`/orders/admin/delivery-boys/${id}`);
  return response.data;
};

export const assignDeliveryBoy = async (orderId, deliveryBoyId) => {
  const response = await api.post(`/orders/admin/assign-delivery/${orderId}`, {
    deliveryBoyId,
  });
  return response.data;
};

export const getReassignmentOptions = async (orderId) => {
  const response = await api.get(`/orders/admin/reassign-options/${orderId}`);
  return response.data;
};

export const reassignDeliveryBoy = async (
  orderId,
  oldDeliveryBoyId,
  newDeliveryBoyId
) => {
  const response = await api.put(`/orders/admin/reassign-delivery/${orderId}`, {
    newDeliveryBoyId,
  });
  return response.data;
};

export const getDeliveryBoyOrdersAdmin = async (boyId) => {
  const response = await api.get(`/orders/admin/delivery-boys/${boyId}/orders`);
  return response.data;
};

// ==================================================
// 💰 COD RECONCILIATION (ADMIN)
// ==================================================

export const getCODReconciliation = async () => {
  const response = await api.get("/orders/admin/reconciliation/cod");
  return response.data;
};

export const settleCOD = async (deliveryBoyId, orderIds) => {
  const response = await api.post("/orders/admin/reconciliation/settle", {
    deliveryBoyId,
    orderIds,
  });
  return response.data;
};

// ==================================================
// 🔐 DELIVERY BOY
// ==================================================

export const loginDeliveryBoy = async (phone, password) => {
  const response = await api.post("/orders/delivery/login", {
    phone,
    password,
  });
  return response.data;
};

export const getDeliveryTasks = async () => {
  const response = await api.get("/orders/delivery/my-tasks");
  return response.data;
};

export const updateDeliveryStatus = async (assignmentId, status) => {
  const response = await api.put(
    `/orders/delivery/update-status/${assignmentId}`,
    { status }
  );
  return response.data;
};
