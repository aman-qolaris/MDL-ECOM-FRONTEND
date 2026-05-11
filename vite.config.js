import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
  },
  build: {
    // Disable source maps in production to reduce build size and build time
    sourcemap: false,
    // Increase the chunk size warning limit (optional, suppresses warnings for large vendor files)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunking strategies to split heavy libraries
        manualChunks: {
          // Core React libraries
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // State management
          "vendor-redux": ["@reduxjs/toolkit", "react-redux"],
          // UI Components & Icons (often large)
          "vendor-ui": [
            "react-icons",
            "react-toastify",
            "clsx",
            "tailwind-merge",
          ],
          // Utilities
          "vendor-utils": [
            "axios",
            "react-hook-form",
            "yup",
            "@hookform/resolvers",
          ],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      reporter: ["text", "lcov"],
    },
  },
});
