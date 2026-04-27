import { createSlice } from "@reduxjs/toolkit";

const USE_MOCK_AUTH = false;

const getUserFromStorage = () => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    if (!user || user === "undefined") return null;

    try {
      return JSON.parse(user);
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem("user");
      return null;
    }
  }
  return null;
};

const initialState = USE_MOCK_AUTH
  ? {
      user: {
        id: 1,
        name: "Test User",
        phone: "9999999999",
        email: "test@example.com",
      },
      isAuthenticated: true,
      loading: false,
      error: null,
    }
  : {
      user: getUserFromStorage(),
      isAuthenticated: !!getUserFromStorage(),
      loading: false,
      error: null,
    };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;

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
      localStorage.removeItem("user");

      if (USE_MOCK_AUTH) {
        window.location.reload();
      }
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
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
