import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBoxOpen,
  FaClipboardList,
  FaRupeeSign,
  FaClock,
  FaCalendarDay,
  FaFilter,
} from "react-icons/fa";
import { getVendorDashboardStats } from "../../services/vendorService";
import StatsCard from "../../components/common/StatsCard";
import Skeleton from "../../components/ui/Skeleton";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- FILTER STATE ---
  const [filterType, setFilterType] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadData();
  }, [filterType, dateRange]); // ❌ navigate removed (not needed)

  const loadData = async () => {
    setLoading(true);
    try {
      let start = null;
      let end = null;
      const today = new Date();

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

      const filterObj = start && end ? { start, end } : null;
      const data = await getVendorDashboardStats(filterObj);
      setStats(data);
    } catch (error) {
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
      value: (val) => `₹${val?.toLocaleString()}`,
      dataKey: "totalSales",
      icon: <FaRupeeSign />,
      color: "bg-green-500",
      link: "/vendor/sales",
      desc:
        filterType === "all" ? "All time revenue" : "Revenue in selected range",
    },
    {
      title: "Total Orders",
      dataKey: "totalOrders",
      icon: <FaClipboardList />,
      color: "bg-blue-500",
      link: "/vendor/order-stats",
      desc: "Orders in selected range",
    },
    {
      title: "My Products",
      dataKey: "productCount",
      icon: <FaBoxOpen />,
      color: "bg-purple-500",
      link: "/vendor/products",
      desc: "Manage Inventory",
    },
    {
      title: "Today's Orders",
      dataKey: "todayOrders",
      icon: <FaCalendarDay />,
      color: "bg-orange-500",
      link: "/vendor/orders?filter=today",
      desc: "Orders received today",
    },
    {
      title: "Pending Orders",
      dataKey: "pendingOrders",
      icon: <FaClock />,
      color: "bg-red-500",
      link: "/vendor/orders?filter=pending",
      desc: "Actions required",
    },
  ];

  return (
    <div className="animate-fadeIn">
      {/* Header + Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>

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
                className={`cursor-pointer px-3 py-1.5 rounded text-xs font-bold uppercase transition-all ${
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
              className={`cursor-pointer px-3 py-1.5 rounded text-xs font-bold uppercase transition-all ${
                filterType === "range"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Custom Range
            </button>
          </div>

          {/* Date Range Inputs */}
          {filterType === "range" && (
            <div className="flex items-center gap-2 animate-fadeIn">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="cursor-pointer bg-gray-50 border border-gray-300 text-gray-700 text-xs rounded px-2 py-1.5 focus:outline-blue-500"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="cursor-pointer bg-gray-50 border border-gray-300 text-gray-700 text-xs rounded px-2 py-1.5 focus:outline-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-32 bg-white rounded-xl border border-gray-200 p-6 flex gap-4"
              >
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-8 w-3/4" />
                </div>
              </div>
            ))
          : cards.map((card, index) => (
              <StatsCard
                key={index}
                title={card.title}
                value={
                  card.value
                    ? card.value(stats[card.dataKey])
                    : stats[card.dataKey]
                }
                icon={card.icon}
                color={card.color}
                link={card.link}
                desc={card.desc}
              />
            ))}
      </div>

      {/* Footer */}
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
