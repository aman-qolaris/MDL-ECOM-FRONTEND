import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Profile from "./pages/Profile";

// --- ADMIN IMPORTS ---
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRoute from "./components/auth/AdminRoute";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import VendorRegister from "./pages/vendor/VendorRegister";
import VendorLayout from "./components/vendor/VendorLayout";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorProducts from "./pages/vendor/VendorProducts";
import VendorAddProduct from "./pages/vendor/VendorAddProduct";
import VendorOrders from "./pages/vendor/VendorOrders";
import VendorProfile from "./pages/vendor/VendorProfile";
import AdminSettings from "./pages/admin/AdminSettings";
import VendorLogin from "./pages/vendor/VendorLogin";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminVendors from "./pages/admin/AdminVendors";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails";
import AdminDeliveryBoys from "./pages/admin/AdminDeliveryBoys";
import ScrollToTop from "./components/layout/ScrollToTop";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminVendorSales from "./pages/admin/AdminVendorSales";
import AdminVendorInventory from "./pages/admin/AdminVendorInventory";
import VendorSales from "./pages/vendor/VendorSales";
import VendorOrderStats from "./pages/vendor/VendorOrderStats";
import AdminSales from "./pages/admin/AdminSales";
import AdminTodaysOrders from "./pages/admin/AdminTodaysOrders";
import AdminPendingOrders from "./pages/admin/AdminPendingOrders";
import AdminCODReconciliation from "./pages/admin/AdminCODReconciliation";
import AssignedOrders from "./pages/admin/AssignedOrders";
import AdminDeliveryBoyDetails from "./pages/admin/AdminDeliveryBoyDetails";
import DeliveryLogin from "./pages/delivery/DeliveryLogin";
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* === ADMIN ROUTES (PROTECTED) === */}
        {/* Wrap AdminLayout with AdminRoute */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            {/* 👇 NEW ROUTES */}
            <Route path="sales" element={<AdminSales />} />
            <Route path="orders/today" element={<AdminTodaysOrders />} />
            <Route path="orders/pending" element={<AdminPendingOrders />} />
            {/* 👇 CHANGE 1: Main link now goes to Vendor List */}
            <Route path="inventory" element={<AdminInventory />} />

            {/* 👇 CHANGE 2: Dynamic route for specific vendor products. Reuses AdminProducts */}
            <Route
              path="inventory/vendor/:vendorId"
              element={<AdminVendorInventory />}
            />
            <Route
              path="inventory/vendor/:vendorId/sales"
              element={<AdminVendorSales />}
            />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetails />} />
            <Route path="vendors" element={<AdminVendors />} />
            {/* 👈 Add this line */}
            <Route path="users" element={<AdminUsers />} />
            {/* 🟢 ADD THESE TWO ROUTES */}
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
            <Route path="settings" element={<AdminSettings />} />
            {/* Future admin routes... */}
          </Route>
        </Route>

        {/* === DELIVERY ROUTES === */}
        <Route path="/delivery/login" element={<DeliveryLogin />} />

        {/* Protected Delivery Routes (You will eventually wrap these) */}
        <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />

        {/* === VENDOR ROUTES === */}
        {/* In real app, wrap this with <VendorRoute> to protect it */}
        <Route path="/vendor" element={<VendorLayout />}>
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="sales" element={<VendorSales />} />
          <Route path="order-stats" element={<VendorOrderStats />} />
          <Route path="products" element={<VendorProducts />} />
          <Route path="products/new" element={<VendorAddProduct />} />
          <Route path="orders" element={<VendorOrders />} />
          <Route path="profile" element={<VendorProfile />} />
        </Route>

        {/* === CUSTOMER ROUTES (Uses AppShell with Header/Footer) === */}
        <Route path="/" element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* <--- 2. ADD VENDOR ROUTE HERE --- */}
          <Route path="vendor/register" element={<VendorRegister />} />
          <Route path="vendor/login" element={<VendorLogin />} />

          <Route path="shop" element={<Shop />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />

          <Route path="order-success" element={<OrderSuccess />} />

          {/* Protected Customer Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="checkout" element={<Checkout />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* 404 Page (Only for customer paths) */}
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
    </BrowserRouter>
  );
}

export default App;
