import React, { useEffect, useState } from "react";
import {
  FaMoneyBillWave,
  FaClipboardList,
  FaUsers,
  FaClock,
  FaCalendarDay,
} from "react-icons/fa";
import { getDashboardStats } from "../../services/adminService";
import StatsCard from "../../components/admin/common/StatsCard";
import Skeleton from "../../components/ui/Skeleton";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        // Handle error (toast, etc.)
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const cardConfig = [
    {
      title: "Total Sales",
      key: "totalSales",
      formatter: (val) => `₹${val?.toLocaleString()}`,
      icon: <FaMoneyBillWave />,
      color: "bg-green-500",
      link: "/admin/sales",
      desc: "View detailed reports",
    },
    {
      title: "Total Orders",
      key: "totalOrders",
      icon: <FaClipboardList />,
      color: "bg-blue-500",
      link: "/admin/orders",
      desc: "View all orders",
    },
    {
      title: "Customers",
      key: "totalUsers",
      icon: <FaUsers />,
      color: "bg-purple-500",
      link: "/admin/users",
      desc: "Manage users",
    },
    {
      title: "Today's Orders",
      key: "todayOrders",
      icon: <FaCalendarDay />,
      color: "bg-orange-500",
      link: "/admin/orders/today",
      desc: "Orders placed today",
    },
    {
      title: "Pending Orders",
      key: "pendingOrders",
      icon: <FaClock />,
      color: "bg-red-500",
      link: "/admin/orders/pending",
      desc: "Orders needing attention",
    },
  ];

  return (
    <div className="p-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {loading
          ? // Loading Skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl border border-gray-100 h-32 flex flex-col justify-between"
              >
                <div className="flex gap-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-6 w-3/4" />
                  </div>
                </div>
              </div>
            ))
          : // Actual Cards
            cardConfig.map((card, index) => (
              <StatsCard
                key={index}
                title={card.title}
                value={
                  card.formatter
                    ? card.formatter(stats[card.key])
                    : stats[card.key]
                }
                icon={card.icon}
                color={card.color}
                link={card.link}
                desc={card.desc}
              />
            ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
