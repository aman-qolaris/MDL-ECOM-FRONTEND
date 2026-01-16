import React, { useEffect, useState } from "react";
// 🟢 1. Remove axios, import api
import api from "../../services/api";
import { FaCalendarAlt, FaChartLine, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const VendorSales = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("weekly"); // weekly | monthly | yearly

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // 🟢 2. Use api.get (Cleaner, Auto-Auth)
      const res = await api.get("/orders/vendor/orders");

      // 🟢 3. STRICT FILTERING (Matches Dashboard Logic)
      // Only keep items that are DELIVERED and NOT in a "returned" state
      const validSales = res.data.filter((item) => {
        const status = item.status?.toUpperCase() || "";
        const returnStatus = item.returnStatus?.toUpperCase() || "NONE";

        return (
          status === "DELIVERED" &&
          ["NONE", "REQUESTED", "APPROVED", "PICKUP_SCHEDULED"].includes(
            returnStatus
          )
        );
      });

      setOrders(validSales);
    } catch (err) {
      console.error(err);
      // api.js interceptor handles 401, but we can keep this for safety
      if (err.response?.status === 401) navigate("/vendor/login");
    } finally {
      setLoading(false);
    }
  };

  // --- FILTER LOGIC (Time-based) ---
  const getFilteredData = () => {
    const now = new Date();
    return orders.filter((item) => {
      const itemDate = new Date(item.createdAt);
      // Reset hours to ensure accurate comparison
      itemDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (activeTab === "weekly") {
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);
        return itemDate >= oneWeekAgo;
      }
      if (activeTab === "monthly") {
        return (
          itemDate.getMonth() === now.getMonth() &&
          itemDate.getFullYear() === now.getFullYear()
        );
      }
      if (activeTab === "yearly") {
        return itemDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const filteredOrders = getFilteredData();

  const totalPeriodSales = filteredOrders.reduce(
    (acc, item) => acc + (parseFloat(item.price) || 0),
    0
  );

  if (loading)
    return <div className="p-10 text-center">Loading Sales Data...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/vendor/dashboard")}
          className="text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft /> Back
        </button>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaChartLine className="text-green-600" /> Sales Reports
        </h2>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6 bg-white p-1 rounded-lg w-fit shadow-sm border">
        {["weekly", "monthly", "yearly"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md capitalize text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-green-100 text-green-700 shadow-sm"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            This {tab.replace("ly", "")}
          </button>
        ))}
      </div>

      {/* SUMMARY CARD */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 mb-8 max-w-sm">
        <p className="text-green-600 font-bold uppercase text-xs tracking-wider mb-1">
          Sales ({activeTab})
        </p>
        <h3 className="text-3xl font-extrabold text-gray-800">
          ₹{totalPeriodSales.toLocaleString()}
        </h3>
        <p className="text-gray-400 text-sm mt-2 flex items-center gap-1">
          <FaCalendarAlt /> Net Revenue (Excl. Returns)
        </p>
      </div>

      {/* DETAILED TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-bold text-gray-700">Details of Sold Items</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Product ID</th>
              <th className="p-4">Qty</th>
              <th className="p-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-400">
                  No sales in this period.
                </td>
              </tr>
            ) : (
              filteredOrders.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-mono text-xs">{item.productId}</td>
                  <td className="p-4">{item.quantity}</td>
                  <td className="p-4 text-right font-medium">₹{item.price}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorSales;
