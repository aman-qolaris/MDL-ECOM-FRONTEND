import axios from "axios";
import { store } from "../store/store";
import { logout } from "../store/slices/authSlice";

// ✅ Point to API Gateway on Port 5001
const api = axios.create({
  baseURL: "http://localhost:5007/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const customerToken = state.auth.token;
    const adminToken = localStorage.getItem("adminToken");
    const vendorToken = localStorage.getItem("vendorToken");
    const deliveryToken = localStorage.getItem("deliveryToken");

    // 2. Intelligent Selection based on URL or Page Context
    if (window.location.pathname.startsWith("/admin") && adminToken) {
      // ✅ If on Admin Panel, prioritize Admin Token
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (window.location.pathname.startsWith("/vendor") && vendorToken) {
      // ✅ If on Vendor Panel, prioritize Vendor Token
      config.headers.Authorization = `Bearer ${vendorToken}`;
    } else if (
      window.location.pathname.startsWith("/delivery") &&
      deliveryToken
    ) {
      config.headers.Authorization = `Bearer ${deliveryToken}`;
    } else if (customerToken) {
      // ✅ Default to Customer Token for Shop
      config.headers.Authorization = `Bearer ${customerToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (
        !window.location.pathname.startsWith("/admin") &&
        !window.location.pathname.startsWith("/vendor")
      ) {
        store.dispatch(logout());
      }
    }
    return Promise.reject(error);
  }
);

export default api;
