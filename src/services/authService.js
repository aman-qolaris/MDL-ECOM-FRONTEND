import api from "./api";
import axios from "axios";

// Ensure this matches your running Backend Port (usually 5000 or 5001)
const API_URL = "http://localhost:5007/api";

// ==========================================
// CONFIGURATION: REAL BACKEND CONNECTION
// ==========================================
const USE_MOCK = false;

// --- AUTHENTICATION ---

export const registerUser = async (userData) => {
  // Backend: POST /auth/register
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const loginUser = async ({ phone, password }) => {
  if (USE_MOCK) return;

  // 1. Login to get Token
  // Backend: POST /auth/login
  const { data } = await api.post("/auth/login", { phone, password });
  const token = data.token;

  // 2. Fetch User Profile (to get 'role')
  // Backend: GET /auth/me
  // We manually pass the header here because the Redux store isn't updated yet
  const profileResponse = await api.get("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log("Backend user profile data:", profileResponse.data);

  return {
    token,
    user: profileResponse.data, // Contains id, name, role, email, etc.
  };
};

export const loginAdmin = async (credentials) => {
  // Hits: http://localhost:5007/api/admin/login (Check your ports!)
  const response = await api.post("/admin/login", credentials);
  return response.data;
};

// --- PROFILE MANAGEMENT ---

export const getProfile = async () => {
  // Backend: GET /auth/me
  const response = await api.get("/auth/me");
  return response.data;
};

export const updateUserProfile = async (userId, formData) => {
  // We use 'api' (not axios) so the Interceptor handles the Token/Auth headers automatically.
  // We MUST override Content-Type to allow file uploads (multipart/form-data).
  const response = await api.put("/auth/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.user;
};

// Handle Password Change
export const changePassword = async (userId, currentPassword, newPassword) => {
  // Backend expects 'oldPassword' and 'newPassword'
  const response = await api.post(`/auth/change-password`, {
    oldPassword: currentPassword,
    newPassword: newPassword,
  });
  return response.data;
};

// --- ADMIN FEATURES ---

export const getAllUsers = async () => {
  // Backend: GET /auth/users
  const response = await api.get("/auth/users");
  return response.data;
};

export const deleteUser = async (userId) => {
  console.warn("Backend does not support user deletion yet.");
  return userId;
};

// 👇 ADD THIS FUNCTION
export const changeAdminPassword = async (oldPassword, newPassword) => {
  const response = await api.post("/admin/change-password", {
    oldPassword,
    newPassword,
  });
  return response.data;
};
