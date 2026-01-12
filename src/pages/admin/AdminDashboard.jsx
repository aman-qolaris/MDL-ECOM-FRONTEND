import React, { useEffect, useState } from "react";
import {
  FaMoneyBillWave,
  FaClipboardList,
  FaUsers,
  FaClock,
  FaCalendarDay,
  FaFilter, // Import Filter Icon
} from "react-icons/fa";
import { getDashboardStats } from "../../services/adminService";
import StatsCard from "../../components/admin/common/StatsCard";
import Skeleton from "../../components/ui/Skeleton";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- FILTER STATE ---
  const [filterType, setFilterType] = useState("all"); // 'all', 'today', 'week', 'range'
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchStats();
  }, [filterType, dateRange]); // Refetch when filters change

  const fetchStats = async () => {
    setLoading(true);
    try {
      let start = null;
      let end = null;
      const today = new Date();

      // Logic to determine start/end dates based on filterType
      if (filterType === "today") {
        start = today.toISOString().split("T")[0];
        end = today.toISOString().split("T")[0];
      } else if (filterType === "week") {
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);
        start = lastWeek.toISOString().split("T")[0];
        end = today.toISOString().split("T")[0];
      } else if (filterType === "range") {
        start = dateRange.start;
        end = dateRange.end;
      }

      // Pass the calculated dates to the service
      const filterObj = start && end ? { start, end } : null;
      const data = await getDashboardStats(filterObj);

      setStats(data);
    } catch (error) {
      console.error("Failed to load stats", error);
    } finally {
      setLoading(false);
    }
  };

  const cardConfig = [
    {
      title: "Total Sales",
      key: "totalSales",
      formatter: (val) => `₹${val?.toLocaleString()}`,
      icon: <FaMoneyBillWave />,
      color: "bg-green-500",
      link: "/admin/sales",
      desc:
        filterType === "all" ? "All time revenue" : "Revenue in selected range",
    },
    {
      title: "Total Orders",
      key: "totalOrders",
      icon: <FaClipboardList />,
      color: "bg-blue-500",
      link: "/admin/orders",
      desc: "Orders in selected range",
    },
    {
      title: "Customers",
      key: "totalUsers",
      icon: <FaUsers />,
      color: "bg-purple-500",
      link: "/admin/users",
      desc: "Total registered users", // Users typically stay global
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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>

        {/* --- FILTER UI BAR --- */}
        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-bold uppercase tracking-wider px-2">
            <FaFilter /> Filters:
          </div>

          {/* Preset Buttons */}
          <div className="flex bg-gray-100 rounded-md p-1">
            {["all", "today", "week"].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-all cursor-pointer ${
                  filterType === f
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f}
              </button>
            ))}
            <button
              onClick={() => setFilterType("range")}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-all cursor-pointer ${
                filterType === "range"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Custom Range
            </button>
          </div>

          {/* Date Range Inputs (Only visible when 'range' is selected) */}
          {filterType === "range" && (
            <div className="flex items-center gap-2 animate-fadeIn">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="bg-gray-50 border border-gray-300 text-gray-700 text-xs rounded px-2 py-1.5 focus:outline-blue-500"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="bg-gray-50 border border-gray-300 text-gray-700 text-xs rounded px-2 py-1.5 focus:outline-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
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
          : cardConfig.map((card, index) => (
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
