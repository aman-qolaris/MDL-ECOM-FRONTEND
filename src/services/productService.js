import api from "./api";
import axios from "axios"; // Import axios directly to bypass default interceptors

// Helper to get the base URL consistent with api.js
const BASE_URL = "http://localhost:5007/api";

// ==========================================
// CONFIGURATION: REAL BACKEND CONNECTION
// ==========================================
const USE_MOCK = false;

// --- PUBLIC ROUTES ---

// 1. Get All Products (Matches: GET /api/products)
export const getProducts = async (params = {}) => {
  if (USE_MOCK) return [];

  const response = await api.get("/products", {
    params,
    paramsSerializer: {
      indexes: null,
    },
  });

  return response.data;
};

// 2. Get Single Product (Matches: GET /api/products/:id)
export const getProductById = async (id) => {
  if (USE_MOCK) return null;
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// --- VENDOR & ADMIN ROUTES ---

// Helper function to choose the right token and method
// If a vendor token exists, we prioritize it for creation/updates to support the Vendor Dashboard
const getAuthHeaders = () => {
  const vendorToken = localStorage.getItem("vendorToken");
  const adminToken = localStorage.getItem("token"); // Assuming admin uses the standard auth slice

  // Logic: Use Vendor Token if available, otherwise fall back to Admin/User Token
  return vendorToken ? `Bearer ${vendorToken}` : `Bearer ${adminToken}`;
};

// 3. Create Product (Matches: POST /api/products)
export const createProduct = async (productData) => {
  // We use direct axios here to ensure we can control the token priority
  const token =
    localStorage.getItem("vendorToken") || localStorage.getItem("token");

  const response = await axios.post(`${BASE_URL}/products`, productData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 4. Update Product (Matches: PUT /api/products/:id)
export const updateProduct = async (id, productData) => {
  // Ensure this matches where you actually save the token (e.g., "token")
  const token = localStorage.getItem("vendorToken");

  const response = await axios.put(`${BASE_URL}/products/${id}`, productData, {
    headers: {
      "Content-Type": "multipart/form-data", // axios sets boundary auto for FormData, but this forces intent
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 5. Delete Product (Matches: DELETE /api/products/:id)
export const deleteProduct = async (id) => {
  const token =
    localStorage.getItem("vendorToken") || localStorage.getItem("token");

  const response = await axios.delete(`${BASE_URL}/products/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 6. Get Vendor's Own Products (Matches: GET /api/products/vendor/my-products)
export const getVendorProducts = async () => {
  if (USE_MOCK) return [];

  // 1. Get the Vendor Token explicitly
  const token = localStorage.getItem("vendorToken");

  if (!token) {
    throw new Error("No vendor token found. Please login as a vendor.");
  }

  // 2. Use direct axios call to avoid 'api' interceptor overwriting with customer token
  const response = await axios.get(`${BASE_URL}/products/vendor/my-products`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// ... existing code

// 👇 ADD THIS FUNCTION
export const getAllCategories = async () => {
  const response = await api.get("/products/categories");
  return response.data;
};
