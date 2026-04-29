import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import api from "./services/api";

// Layouts - Keep these static or lazy depending on preference.
// Since they define the structure, keeping them static or eager is often fine,
// but lazy loading them is also consistent. Let's lazy load layouts too for maximum savings.
const AppShell = lazy(() => import("./components/layout/AppShell"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const VendorLayout = lazy(() => import("./components/vendor/VendorLayout"));

// Components that need to be available immediately or are very small can remain static
import ScrollToTop from "./components/layout/ScrollToTop";

// Protected Route Wrappers
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import AdminCreateOrder from "./pages/admin/AdminCreateOrder";
import AdminShippingRates from "./pages/admin/AdminShippingRates";

// --- CUSTOMER PAGES ---
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const Profile = lazy(() => import("./pages/Profile"));

// --- ADMIN PAGES ---
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminSales = lazy(() => import("./pages/admin/AdminSales"));
const AdminTodaysOrders = lazy(() => import("./pages/admin/AdminTodaysOrders"));
const AdminPendingOrders = lazy(
  () => import("./pages/admin/AdminPendingOrders"),
);
const AdminInventory = lazy(() => import("./pages/admin/AdminInventory"));
const AdminVendorInventory = lazy(
  () => import("./pages/admin/AdminVendorInventory"),
);
const AdminVendorSales = lazy(() => import("./pages/admin/AdminVendorSales"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminOrderDetails = lazy(() => import("./pages/admin/AdminOrderDetails"));
const AdminReturnRequests = lazy(
  () => import("./pages/admin/AdminReturnRequests"),
);
const AdminVendors = lazy(() => import("./pages/admin/AdminVendors"));
const AdminVendorDetails = lazy(
  () => import("./pages/admin/AdminVendorDetails"),
);
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AssignedOrders = lazy(() => import("./pages/admin/AssignedOrders"));
const AdminDeliveryBoyDetails = lazy(
  () => import("./pages/admin/AdminDeliveryBoyDetails"),
);
const AdminDeliveryBoys = lazy(() => import("./pages/admin/AdminDeliveryBoys"));
const AdminCODReconciliation = lazy(
  () => import("./pages/admin/AdminCODReconciliation"),
);
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

// --- VENDOR PAGES ---
const VendorRegister = lazy(() => import("./pages/vendor/VendorRegister"));
const VendorLogin = lazy(() => import("./pages/vendor/VendorLogin"));
const VendorDashboard = lazy(() => import("./pages/vendor/VendorDashboard"));
const VendorSales = lazy(() => import("./pages/vendor/VendorSales"));
const VendorOrderStats = lazy(() => import("./pages/vendor/VendorOrderStats"));
const VendorProducts = lazy(() => import("./pages/vendor/VendorProducts"));
const VendorAddProduct = lazy(() => import("./pages/vendor/VendorAddProduct"));
const VendorOrders = lazy(() => import("./pages/vendor/VendorOrders"));
const VendorProfile = lazy(() => import("./pages/vendor/VendorProfile"));

// --- DELIVERY PAGES ---
const DeliveryLogin = lazy(() => import("./pages/delivery/DeliveryLogin"));
const DeliveryDashboard = lazy(
  () => import("./pages/delivery/DeliveryDashboard"),
);
const DeliveryProfile = lazy(() => import("./pages/delivery/DeliveryProfile"));

// Simple Loading Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  useEffect(() => {
    const initializeCsrf = async () => {
      try {
        const isVendorRoute = window.location.pathname.startsWith("/vendor");

        const csrfEndpoint = isVendorRoute
          ? "/vendor/csrf-token"
          : "/auth/csrf-token";

        const response = await api.get(csrfEndpoint);

        api.defaults.headers.common["X-CSRF-Token"] = response.data.csrfToken;

        console.log(
          `🔒 CSRF Protection initialized successfully for ${isVendorRoute ? "Vendor" : "User"}.`,
        );
      } catch (error) {
        console.error("⚠️ Failed to initialize CSRF token:", error.message);
      }
    };

    initializeCsrf();
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      {/* Suspense catches the promise from lazy components and shows fallback UI */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* === ADMIN ROUTES (PROTECTED) === */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="sales" element={<AdminSales />} />
              <Route path="orders/today" element={<AdminTodaysOrders />} />
              <Route path="orders/pending" element={<AdminPendingOrders />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route
                path="inventory/vendor/:vendorId"
                element={<AdminVendorInventory />}
              />
              <Route
                path="inventory/vendor/:vendorId/sales"
                element={<AdminVendorSales />}
              />
              <Route path="orders/create" element={<AdminCreateOrder />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetails />} />
              <Route path="returns" element={<AdminReturnRequests />} />
              <Route path="vendors" element={<AdminVendors />} />
              <Route path="vendors/:id" element={<AdminVendorDetails />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="assigned-orders" element={<AssignedOrders />} />
              <Route
                path="assigned-orders/:id"
                element={<AdminDeliveryBoyDetails />}
              />
              <Route path="delivery-boys" element={<AdminDeliveryBoys />} />
              <Route
                path="cod-reconciliation"
                element={<AdminCODReconciliation />}
              />
              <Route path="shipping-rates" element={<AdminShippingRates />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* === DELIVERY ROUTES === */}
          <Route path="/delivery/login" element={<DeliveryLogin />} />
          <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
          <Route path="/delivery/profile" element={<DeliveryProfile />} />

          {/* Vendor Auth Public Routes */}
          <Route path="vendor/register" element={<VendorRegister />} />
          <Route path="vendor/login" element={<VendorLogin />} />

          {/* === VENDOR ROUTES === */}
          <Route path="/vendor" element={<VendorLayout />}>
            <Route path="dashboard" element={<VendorDashboard />} />
            <Route path="sales" element={<VendorSales />} />
            <Route path="order-stats" element={<VendorOrderStats />} />
            <Route path="products" element={<VendorProducts />} />
            <Route path="products/new" element={<VendorAddProduct />} />
            <Route path="orders" element={<VendorOrders />} />
            <Route path="profile" element={<VendorProfile />} />
          </Route>

          {/* === CUSTOMER ROUTES === */}
          <Route path="/" element={<AppShell />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            <Route path="shop" element={<Shop />} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="cart" element={<Cart />} />
            <Route path="order-success" element={<OrderSuccess />} />

            <Route element={<ProtectedRoute />}>
              <Route path="checkout" element={<Checkout />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route
              path="*"
              element={
                <div className="text-center mt-20 text-2xl">
                  404: Page Not Found
                </div>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
