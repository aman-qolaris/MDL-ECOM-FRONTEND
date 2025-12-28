import { createSlice } from "@reduxjs/toolkit";

// ==========================================
// CONFIGURATION: AUTH DEBUG SWITCH
// ==========================================
// Set TRUE: Instant Login (Good for UI testing)
// Set FALSE: Real Login (Required for Production)
const USE_MOCK_AUTH = false;

// Helper to safely access localStorage
const getTokenFromStorage = () => {
  if (typeof window !== "undefined") return localStorage.getItem("token");
  return null;
};

const getUserFromStorage = () => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    // Check if user is null, undefined, or the string "undefined"
    if (!user || user === "undefined") return null;

    try {
      return JSON.parse(user);
    } catch (error) {
      console.error("Error parsing user data:", error);
      // Clean up corrupt data automatically
      localStorage.removeItem("user");
      return null;
    }
  }
  return null;
};

// Determine initial state based on the switch
const initialState = USE_MOCK_AUTH
  ? {
      // MOCK MODE: Hardcoded "Test User"
      user: {
        id: 1, // IMPORTANT: Ensure this ID exists in your backend database if connecting to real API
        name: "Test User",
        phone: "9999999999",
        email: "test@example.com", // Added email field
      },
      token: "mock-debug-token",
      isAuthenticated: true,
      loading: false,
      error: null,
    }
  : {
      // REAL MODE: Load from storage
      user: getUserFromStorage(),
      token: getTokenFromStorage(),
      isAuthenticated: !!getTokenFromStorage(),
      loading: false,
      error: null,
    };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;

      // Only save to storage if we are in Real Mode (or want to persist login)
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Optional: If you click Logout in Mock Mode, force a reload to clear the hardcoded state
      if (USE_MOCK_AUTH) {
        window.location.reload();
      }
    },
    updateUser: (state, action) => {
      // Merge old user data with new updates
      state.user = { ...state.user, ...action.payload };
      // Update local storage so the change persists on refresh
      if (localStorage.getItem("user")) {
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  authStart,
  authSuccess,
  authFailure,
  logout,
  updateUser,
  clearError,
} = authSlice.actions;
export default authSlice.reducer;
