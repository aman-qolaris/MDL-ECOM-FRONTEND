import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaClock, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminPendingOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token =
          localStorage.getItem("adminToken") || localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5007/api/orders/admin/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setOrders(
          res.data.filter((o) => ["PENDING", "PROCESSING"].includes(o.status))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

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
          <FaClock className="text-red-500" /> Pending Orders
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">User</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Amount</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-400">
                  No pending orders.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-mono">{o.id}</td>
                  <td className="p-4">User #{o.userId}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">₹{o.amount}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => navigate(`/admin/orders/${o.id}`)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Manage Order
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPendingOrders;
