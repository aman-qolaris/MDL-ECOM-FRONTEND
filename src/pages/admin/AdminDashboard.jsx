import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaMoneyBillWave,
  FaClipboardList,
  FaUsers,
  FaClock,
  FaCalendarDay,
} from "react-icons/fa";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    todayOrders: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // 1. Fetch All Orders (to calculate sales, today, pending)
      const ordersRes = await axios.get(
        "http://localhost:5007/api/orders/admin/all",
        config
      );
      const orders = ordersRes.data;

      // 2. Fetch All Users
      const usersRes = await axios.get(
        "http://localhost:5007/api/auth/users",
        config
      );

      // --- CALCULATIONS ---

      // A. Total Sales (Sum of Delivered orders)
      const totalSales = orders
        .filter((o) => o.status === "DELIVERED")
        .reduce((acc, o) => acc + (parseFloat(o.amount) || 0), 0);

      // B. Today's Orders
      const today = new Date().toISOString().split("T")[0];
      const todayOrders = orders.filter(
        (o) => o.createdAt && o.createdAt.startsWith(today)
      ).length;

      // C. Pending Orders
      const pendingOrders = orders.filter((o) =>
        ["PENDING", "PROCESSING"].includes(o.status)
      ).length;

      setStats({
        totalSales,
        totalOrders: orders.length,
        totalUsers: usersRes.data.length,
        todayOrders,
        pendingOrders,
      });
    } catch (error) {
      console.error("Failed to load admin stats", error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: "Total Sales",
      value: `₹${stats.totalSales.toLocaleString()}`,
      icon: <FaMoneyBillWave />,
      color: "bg-green-500",
      link: "/admin/sales",
      desc: "View detailed reports",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <FaClipboardList />,
      color: "bg-blue-500",
      link: "/admin/orders",
      desc: "View all orders",
    },
    {
      title: "Customers",
      value: stats.totalUsers,
      icon: <FaUsers />,
      color: "bg-purple-500",
      link: "/admin/users",
      desc: "Manage users",
    },
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      icon: <FaCalendarDay />,
      color: "bg-orange-500",
      link: "/admin/orders/today",
      desc: "Orders placed today",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: <FaClock />,
      color: "bg-red-500",
      link: "/admin/orders/pending",
      desc: "Orders needing attention",
    },
  ];

  if (loading)
    return <div className="p-8 text-center">Loading Dashboard...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => navigate(card.link)}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg ${card.color}`}
              >
                {card.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">
                  {card.title}
                </p>
                <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600">
                  {card.value}
                </h3>
              </div>
            </div>
            <p className="text-xs text-gray-400 flex items-center justify-between">
              {card.desc} <span>→</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
