import axios from "axios";
import { store } from "../store/store";
import { logout } from "../store/slices/authSlice";

const api = axios.create({
  baseURL: "http://localhost:5007/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,

  xsrfCookieName: "_csrf",
  xsrfHeaderName: "X-CSRF-Token",
});

api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const customerToken = state.auth?.token || localStorage.getItem("token");
    const adminToken = localStorage.getItem("adminToken");
    const vendorToken = localStorage.getItem("vendorToken");
    const deliveryToken = localStorage.getItem("deliveryToken");

    if (window.location.pathname.startsWith("/admin") && adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (window.location.pathname.startsWith("/vendor") && vendorToken) {
      config.headers.Authorization = `Bearer ${vendorToken}`;
    } else if (
      window.location.pathname.startsWith("/delivery") &&
      deliveryToken
    ) {
      config.headers.Authorization = `Bearer ${deliveryToken}`;
    } else if (customerToken) {
      config.headers.Authorization = `Bearer ${customerToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      if (
        !window.location.pathname.startsWith("/admin") &&
        !window.location.pathname.startsWith("/vendor")
      ) {
        store.dispatch(logout());
      }
    }

    if (status === 429) {
      console.warn("Rate limit triggered.");
      error.message =
        "You are making requests too quickly. Please wait a moment and try again.";
    }

    if (status === 400 && error.response?.data?.errors) {
      error.validationErrors = error.response.data.errors;
    }

    if (status === 403 && error.response?.data?.message?.includes("CSRF")) {
      console.error("CSRF token missing or invalid. Please refresh the page.");
    }

    return Promise.reject(error);
  },
);

export default api;
