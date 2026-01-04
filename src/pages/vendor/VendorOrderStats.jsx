import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBox, FaArrowLeft, FaClipboardList } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const VendorOrderStats = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("weekly");

  useEffect(() => {
    fetchOrders();
  }, []);

  // ... imports

  const fetchOrders = async () => {
    try {
      // ✅ FIX: Check 'vendorToken'
      const token =
        localStorage.getItem("vendorToken") ||
        localStorage.getItem("token") ||
        JSON.parse(localStorage.getItem("userInfo") || "{}").token;

      const res = await axios.get(
        "http://localhost:5007/api/orders/vendor/orders",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) navigate("/vendor/login");
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the file

  const getFilteredData = () => {
    const now = new Date();
    return orders.filter((item) => {
      const itemDate = new Date(item.createdAt);
      if (activeTab === "weekly") {
        const oneWeekAgo = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 7
        );
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

  if (loading)
    return <div className="p-10 text-center">Loading Order Stats...</div>;

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
          <FaClipboardList className="text-blue-600" /> Order Statistics
        </h2>
      </div>

      <div className="flex gap-2 mb-6 bg-white p-1 rounded-lg w-fit shadow-sm border">
        {["weekly", "monthly", "yearly"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md capitalize text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-blue-100 text-blue-700 shadow-sm"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            This {tab.replace("ly", "")}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 mb-8 max-w-sm">
        <p className="text-blue-600 font-bold uppercase text-xs tracking-wider mb-1">
          Total Orders ({activeTab})
        </p>
        <h3 className="text-3xl font-extrabold text-gray-800">
          {filteredOrders.length}
        </h3>
        <p className="text-gray-400 text-sm mt-2">Items ordered</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-bold text-gray-700">Order Details</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Product ID</th>
              <th className="p-4 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-400">
                  No orders in this period.
                </td>
              </tr>
            ) : (
              filteredOrders.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        item.status === "DELIVERED"
                          ? "bg-green-100 text-green-700"
                          : item.status === "CANCELLED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs">{item.productId}</td>
                  <td className="p-4 text-right">₹{item.price}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorOrderStats;
