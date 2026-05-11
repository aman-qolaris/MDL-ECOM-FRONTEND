import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getDashboardStats, getAllOrders } from "../../services/adminService";
import { FaArrowLeft, FaCalendarAlt, FaFilter } from "react-icons/fa";
import PropTypes from "prop-types";

const TableMessageRow = ({ message }) => (
  <tr>
    <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
      {message}
    </td>
  </tr>
);

TableMessageRow.propTypes = {
  message: PropTypes.string.isRequired,
};

const TotalSales = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterMode = searchParams.get("filter");

  const [activeTab, setActiveTab] = useState("all");
  const [revenue, setRevenue] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, [activeTab]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      // 1. Determine Date Range
      const now = new Date();
      let start = null;
      let end = null;

      if (activeTab !== "all") {
        end = now.toISOString();
        if (activeTab === "week") {
          const lastWeek = new Date(now);
          lastWeek.setDate(now.getDate() - 7);
          start = lastWeek.toISOString();
        } else if (activeTab === "month") {
          start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        } else if (activeTab === "year") {
          start = new Date(now.getFullYear(), 0, 1).toISOString();
        }
      }

      // 2. Fetch Stats
      const statsPayload = start && end ? { start, end } : {};
      const stats = await getDashboardStats(statsPayload);
      setRevenue(stats.totalSales || 0);

      // 3. Fetch Orders for Table
      const allOrdersRes = await getAllOrders(1, 100);
      let allOrdersList = Array.isArray(allOrdersRes)
        ? allOrdersRes
        : allOrdersRes.orders || [];

      // 4. FILTERING LOGIC
      if (filterMode === "revenue") {
        allOrdersList = allOrdersList.filter((order) => {
          if (order.status !== "DELIVERED") return false;
          if (["RETURNED", "REFUNDED", "CANCELLED"].includes(order.status))
            return false;
          return true;
        });
      }

      // 5. Apply Date Filter
      if (activeTab !== "all") {
        allOrdersList = allOrdersList.filter((order) => {
          if (!order.createdAt) return false;
          const orderDate = new Date(order.createdAt);
          return orderDate >= new Date(start) && orderDate <= new Date(end);
        });
      }

      setOrders(allOrdersList);
    } catch (error) {
      console.error("Error fetching sales reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderTableBody = () => {
    if (loading) return <TableMessageRow message="Loading data..." />;
    if (orders.length === 0)
      return <TableMessageRow message="No matching sales found." />;

    return (
      <>
        {orders.map((order) => (
          <tr key={order.id} className="hover:bg-green-50/50 transition">
            <td className="px-6 py-4 whitespace-nowrap">
              {new Date(order.createdAt).toLocaleDateString("en-IN")}
            </td>
            <td className="px-6 py-4 font-mono text-blue-600 font-medium">
              #{order.id}
            </td>
            <td className="px-6 py-4">User {order.userId}</td>
            <td className="px-6 py-4 text-xs font-bold">
              <span
                className={`px-2 py-1 rounded border ${
                  order.status === "DELIVERED"
                    ? "bg-green-50 text-green-700 border-green-100"
                    : "bg-gray-50 text-gray-600 border-gray-200"
                }`}
              >
                {order.status}
              </span>
            </td>
            <td className="px-6 py-4 text-right font-bold text-gray-800 text-base">
              ₹{Number.parseFloat(order.amount || 0).toLocaleString()}
            </td>
          </tr>
        ))}
      </>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="p-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-green-600">📈</span> Total Sales Reports
            </h1>
            {filterMode === "revenue" && (
              <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-md border border-green-200">
                <FaFilter className="inline mr-1 mb-0.5" /> Showing Net Revenue
                Only
              </span>
            )}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl border border-gray-200 shadow-sm w-fit">
        {["all", "week", "month", "year"].map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-green-400 ${
              activeTab === tab
                ? "bg-green-600 text-white shadow-md"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {tab === "all"
              ? "All Time"
              : `This ${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
          </button>
        ))}
      </div>

      {/* REVENUE CARD */}
      <div className="bg-white p-8 rounded-2xl border border-green-100 shadow-sm mb-8 max-w-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-100 text-green-600 rounded-lg">
            <FaCalendarAlt />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Total Revenue ({activeTab === "all" ? "All Time" : activeTab})
          </p>
        </div>
        <h2 className="text-5xl font-extrabold text-gray-800 tracking-tight">
          {loading ? "..." : `₹${revenue.toLocaleString()}`}
        </h2>
      </div>

      {/* SALES TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-700">Transactions</h3>
          <span className="text-xs font-mono text-gray-400 bg-white px-2 py-1 rounded border">
            {orders.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {renderTableBody()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TotalSales;
