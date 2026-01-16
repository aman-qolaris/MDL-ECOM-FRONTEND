import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaBox,
  FaChartLine,
  FaClipboardList,
  FaSignOutAlt,
  FaStore,
  FaUser,
} from "react-icons/fa";
import api from "../../services/api";
import axios from "axios"; // Direct axios for manual token control

const VendorLayout = () => {
  const navigate = useNavigate();
  const [shopName, setShopName] = useState("My Shop");

  useEffect(() => {
    const fetchShopName = async () => {
      const token = localStorage.getItem("vendorToken");

      // 1. If no token, redirect immediately
      if (!token) {
        navigate("/vendor/login");
        return;
      }

      try {
        // 2. Fetch Profile
        // We use direct axios to ensure we send the VENDOR token, not the customer one
        const response = await axios.get(
          "http://localhost:5007/api/vendor/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data && response.data.businessName) {
          setShopName(response.data.businessName);
        }
      } catch (error) {
        console.error("Failed to fetch shop name:", error);

        // 3. If 401 (Unauthorized) or 403 (Forbidden), force logout
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          localStorage.removeItem("vendorToken");
          navigate("/vendor/login");
        }
      }
    };

    fetchShopName();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("vendorToken");
    navigate("/vendor/login");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <div className="w-full md:w-64 bg-purple-800 text-white flex flex-col">
        <div className="p-6 text-center border-b border-purple-700">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            <FaStore /> Vendor Panel
          </h1>
          <p className="text-purple-300 text-sm mt-1 font-medium px-2 truncate">
            {shopName}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/vendor/dashboard"
            className="flex items-center gap-3 px-4 py-3 hover:bg-purple-700 rounded-lg transition"
          >
            <FaChartLine /> Dashboard
          </Link>
          <Link
            to="/vendor/products"
            className="flex items-center gap-3 px-4 py-3 hover:bg-purple-700 rounded-lg transition"
          >
            <FaBox /> My Products
          </Link>
          <Link
            to="/vendor/orders"
            className="flex items-center gap-3 px-4 py-3 hover:bg-purple-700 rounded-lg transition"
          >
            <FaClipboardList /> My Orders
          </Link>
          <Link
            to="/vendor/profile"
            className="flex items-center gap-3 px-4 py-3 hover:bg-purple-700 rounded-lg transition"
          >
            <FaUser /> Shop Profile
          </Link>
        </nav>

        <div className="p-4 border-t border-purple-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-red-600 rounded-lg transition"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <h2 className="text-xl font-bold text-gray-800">Vendor Portal</h2>
          <Link
            to="/vendor/profile"
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
          >
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
              Verified Seller
            </span>
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
              {shopName.charAt(0).toUpperCase()}
            </div>
          </Link>
        </header>

        <main className="p-3 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
