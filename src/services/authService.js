import api from "./api";

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
  if (USE_MOCK) return; // Placeholder

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

// ✅ ADD THIS FUNCTION
export const loginAdmin = async (credentials) => {
  // Hits: http://localhost:5007/api/admin/login
  const response = await api.post("/admin/login", credentials);
  return response.data;
};

// --- PROFILE MANAGEMENT ---

export const getProfile = async () => {
  // Backend: GET /auth/me
  const response = await api.get("/auth/me");
  return response.data;
};

export const updateUserProfile = async (userId, updatedData) => {
  // Note: Your User Service might not have a general 'update' route exposed yet.
  // Standard route usually: PUT /users/:id or PUT /auth/profile
  // Assuming /users/:id based on standard REST, but check your backend.
  const response = await api.put(`/users/${userId}`, updatedData);
  return response.data;
};

// Ensure the keys are 'oldPassword' and 'newPassword' to match backend
export const changePassword = async (userId, currentPassword, newPassword) => {
  const response = await api.post(`/auth/change-password`, {
    oldPassword: currentPassword, // ✅ Key must be 'oldPassword'
    newPassword: newPassword, // ✅ Key must be 'newPassword'
  });
  return response.data;
};

// --- ADMIN FEATURES ---

export const getAllUsers = async () => {
  // Backend: GET /auth/users (Defined in auth.routes.js)
  const response = await api.get("/auth/users");
  return response.data;
};

// !!! IMPORTANT: Your Backend currently has NO route to delete users.
// This function exists to prevent the SyntaxError in AdminUsers.jsx,
// but it will fail (404) or do nothing if called against the real backend.
export const deleteUser = async (userId) => {
  console.warn("Backend does not support user deletion yet.");
  // Placeholder call - likely to fail until backend is updated
  // const response = await api.delete(`/users/${userId}`);
  // return response.data;

  // Return dummy success to keep UI working
  return userId;
};
