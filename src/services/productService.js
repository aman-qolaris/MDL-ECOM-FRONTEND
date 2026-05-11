import api from "./api";
import axios from "axios";

const PRODUCTS_CACHE_TTL_MS = 15_000;
const productsListCache = new Map();
const productsListInFlight = new Map();
const productByIdCache = new Map();
const productByIdInFlight = new Map();

const stableParamsKey = (params = {}) => {
  const entries = Object.entries(params)
    .filter(([, v]) => v !== "" && v !== null && v !== undefined)
    .sort(([a], [b]) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  return JSON.stringify(entries);
};

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

  const key = stableParamsKey(params);
  const cached = productsListCache.get(key);
  const now = Date.now();
  if (cached && now - cached.ts < PRODUCTS_CACHE_TTL_MS) return cached.data;

  const inFlight = productsListInFlight.get(key);
  if (inFlight) return inFlight;

  const promise = api
    .get("/products", {
      params,
      paramsSerializer: {
        indexes: null,
      },
    })
    .then((response) => {
      productsListCache.set(key, { ts: Date.now(), data: response.data });
      return response.data;
    })
    .finally(() => {
      productsListInFlight.delete(key);
    });

  productsListInFlight.set(key, promise);
  return promise;
};

// 2. Get Single Product (Matches: GET /api/products/:id)
export const getProductById = async (id) => {
  if (USE_MOCK) return null;

  const key = String(id);
  const cached = productByIdCache.get(key);
  const now = Date.now();
  if (cached && now - cached.ts < PRODUCTS_CACHE_TTL_MS) return cached.data;

  const inFlight = productByIdInFlight.get(key);
  if (inFlight) return inFlight;

  const promise = api
    .get(`/products/${id}`)
    .then((response) => {
      productByIdCache.set(key, { ts: Date.now(), data: response.data });
      return response.data;
    })
    .finally(() => {
      productByIdInFlight.delete(key);
    });

  productByIdInFlight.set(key, promise);
  return promise;
};

export const prefetchProductById = async (id) => {
  try {
    await getProductById(id);
  } catch {
    // best-effort only
  }
};

// --- VENDOR & ADMIN ROUTES ---

// Helper function to choose the right token and method
const getAuthHeaders = () => {
  const vendorToken = globalThis.localStorage.getItem("vendorToken");
  const adminToken = globalThis.localStorage.getItem("token");

  return vendorToken ? `Bearer ${vendorToken}` : `Bearer ${adminToken}`;
};

// 3. Create Product (Matches: POST /api/products)
export const createProduct = async (productData) => {
  const token =
    globalThis.localStorage.getItem("vendorToken") ||
    globalThis.localStorage.getItem("adminToken") ||
    globalThis.localStorage.getItem("token");

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
  const token =
    globalThis.localStorage.getItem("vendorToken") ||
    globalThis.localStorage.getItem("adminToken") ||
    globalThis.localStorage.getItem("token");

  const response = await axios.put(`${BASE_URL}/products/${id}`, productData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 5. Delete Product (Matches: DELETE /api/products/:id)
export const deleteProduct = async (id) => {
  const token =
    globalThis.localStorage.getItem("vendorToken") ||
    globalThis.localStorage.getItem("adminToken") ||
    globalThis.localStorage.getItem("token");

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

  const token = globalThis.localStorage.getItem("vendorToken");

  if (!token) {
    throw new Error("No vendor token found. Please login as a vendor.");
  }

  const response = await axios.get(`${BASE_URL}/products/vendor/my-products`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getAllCategories = async () => {
  const response = await api.get("/products/categories");
  return response.data;
};

// 🟢 NEW: Get a specific Vendor's Products (For Admin)
export const getVendorProductsForAdmin = async (vendorId) => {
  const response = await api.get(`/products/vendor/${vendorId}`);
  return response.data;
};

// 🟢 NEW: Update Warehouse Stock (For Admin)
export const updateWarehouseStockByAdmin = async (
  productId,
  warehouseStock,
) => {
  const response = await api.put("/products/admin/inventory/update", {
    productId,
    warehouseStock,
  });
  return response.data;
};
