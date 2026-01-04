import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaChartLine, FaArrowLeft, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminSales = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("weekly");

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const token =
          localStorage.getItem("adminToken") || localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5007/api/orders/admin/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Filter only delivered orders for actual sales
        setOrders(res.data.filter((o) => o.status === "DELIVERED"));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const getFilteredData = () => {
    const now = new Date();
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      if (activeTab === "weekly") {
        const oneWeekAgo = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 7
        );
        return orderDate >= oneWeekAgo;
      }
      if (activeTab === "monthly") {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      if (activeTab === "yearly") {
        return orderDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const filteredOrders = getFilteredData();
  const totalSales = filteredOrders.reduce(
    (acc, o) => acc + (parseFloat(o.amount) || 0),
    0
  );

  if (loading)
    return <div className="p-10 text-center">Loading Sales Data...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft /> Back
        </button>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaChartLine className="text-green-600" /> Total Sales Reports
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

      <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 mb-8 max-w-sm">
        <p className="text-green-600 font-bold uppercase text-xs tracking-wider mb-1">
          Total Revenue ({activeTab})
        </p>
        <h3 className="text-3xl font-extrabold text-gray-800">
          ₹{totalSales.toLocaleString()}
        </h3>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-bold text-gray-700">Sales Transactions</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Order ID</th>
              <th className="p-4">User ID</th>
              <th className="p-4">Payment Method</th>
              <th className="p-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-400">
                  No sales found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-mono text-xs">{o.id}</td>
                  <td className="p-4">{o.userId}</td>
                  <td className="p-4">{o.paymentMethod}</td>
                  <td className="p-4 text-right font-bold">₹{o.amount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSales;
