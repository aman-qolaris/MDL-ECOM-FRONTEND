import { createSlice } from "@reduxjs/toolkit";

const USE_MOCK_AUTH = false;

const getUserFromStorage = () => {
  if (globalThis.window !== undefined && globalThis.localStorage) {
    const user = globalThis.localStorage.getItem("user");
    if (!user || user === "undefined") return null;

    try {
      return JSON.parse(user);
    } catch (error) {
      console.error("Error parsing user data:", error);
      globalThis.localStorage.removeItem("user");
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
      token:
        globalThis.window !== undefined && globalThis.localStorage
          ? globalThis.localStorage.getItem("token")
          : null,
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
      state.token = action.payload.token;

      globalThis.localStorage.setItem(
        "user",
        JSON.stringify(action.payload.user),
      );
    },
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      globalThis.localStorage.removeItem("user");
      globalThis.localStorage.removeItem("token");

      if (USE_MOCK_AUTH) {
        globalThis.location.reload();
      }
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };

      if (globalThis.localStorage.getItem("user")) {
        globalThis.localStorage.setItem("user", JSON.stringify(state.user));
      }
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
