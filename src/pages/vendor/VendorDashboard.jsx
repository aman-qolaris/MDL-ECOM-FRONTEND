import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBoxOpen,
  FaClipboardList,
  FaRupeeSign,
  FaClock,
  FaCalendarDay,
} from "react-icons/fa";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    productCount: 0,
    todayOrders: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // ✅ FIX: Check 'vendorToken' first!
      const token =
        localStorage.getItem("vendorToken") ||
        localStorage.getItem("token") ||
        JSON.parse(localStorage.getItem("userInfo") || "{}").token;

      if (!token) {
        console.error("No token found. Redirecting to login.");
        navigate("/vendor/login");
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };

      // 1. Fetch All Orders (Order Items) for this Vendor
      const ordersRes = await axios.get(
        "http://localhost:5007/api/orders/vendor/orders",
        config
      );
      const orders = ordersRes.data;

      // 2. Fetch All Products
      const productsRes = await axios.get(
        "http://localhost:5007/api/products/vendor/my-products",
        config
      );

      // --- CALCULATIONS ---

      const totalSales = orders
        .filter((item) => item.status === "DELIVERED")
        .reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);

      const today = new Date().toISOString().split("T")[0];
      const todayOrders = orders.filter(
        (item) => item.createdAt && item.createdAt.startsWith(today)
      ).length;

      const pendingOrders = orders.filter((item) =>
        ["PENDING", "PROCESSING"].includes(item.status)
      ).length;

      setStats({
        totalSales,
        totalOrders: orders.length,
        productCount: productsRes.data.length,
        todayOrders,
        pendingOrders,
      });
    } catch (error) {
      console.error("Dashboard fetch failed:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/vendor/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: "Total Sales",
      value: `₹${stats.totalSales.toLocaleString()}`,
      icon: <FaRupeeSign />,
      color: "bg-green-500",
      link: "/vendor/sales",
      desc: "View Sales Reports",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <FaClipboardList />,
      color: "bg-blue-500",
      link: "/vendor/order-stats",
      desc: "View Order Stats",
    },
    {
      title: "My Products",
      value: stats.productCount,
      icon: <FaBoxOpen />,
      color: "bg-purple-500",
      link: "/vendor/products",
      desc: "Manage Inventory",
    },
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      icon: <FaCalendarDay />,
      color: "bg-orange-500",
      link: "/vendor/orders?filter=today", // ✅ Added ?filter=today
      desc: "Orders received today",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: <FaClock />,
      color: "bg-red-500",
      link: "/vendor/orders?filter=pending", // ✅ Added ?filter=pending
      desc: "Actions required",
    },
  ];

  if (loading)
    return <div className="p-8 text-center">Loading Dashboard...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Dashboard Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {cards.map((stat, index) => (
          <div
            key={index}
            onClick={() => navigate(stat.link)}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-md ${stat.color}`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {stat.value}
                </h3>
              </div>
            </div>
            <div className="border-t pt-3 mt-1">
              <p className="text-xs text-gray-400 flex justify-between items-center">
                {stat.desc}
                <span className="text-gray-300 group-hover:text-blue-500">
                  →
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          Welcome back to your Vendor Portal
        </h3>
        <p className="text-gray-500">
          Select a card above to view detailed reports or manage your store.
        </p>
      </div>
    </div>
  );
};

export default VendorDashboard;
