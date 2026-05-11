import React, { useEffect, useState } from "react";
import { FaCalendarDay, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getAllOrders } from "../../services/orderService";

const AdminTodaysOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const responseData = await getAllOrders();

        // Safety check to ensure we are filtering an array
        const allOrdersList = Array.isArray(responseData)
          ? responseData
          : responseData?.orders || [];

        const today = new Date().toISOString().split("T");
        setOrders(allOrdersList.filter((o) => o.createdAt?.startsWith(today)));
      } catch (err) {
        console.error("Failed to fetch today's orders:", err);
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
          type="button"
          onClick={() => navigate("/admin/dashboard")}
          className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 text-gray-600 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <FaArrowLeft />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaCalendarDay className="text-orange-500" /> Today's Orders
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
                  No orders placed today.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-mono">{o.id}</td>
                  <td className="p-4">User #{o.userId}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold">
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">₹{o.amount}</td>
                  <td className="p-4 text-center">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/orders/${o.id}`)}
                      className="text-blue-600 hover:underline text-xs focus:outline-none focus:ring-2 focus:ring-blue-200 rounded px-1"
                    >
                      View Details
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

export default AdminTodaysOrders;
