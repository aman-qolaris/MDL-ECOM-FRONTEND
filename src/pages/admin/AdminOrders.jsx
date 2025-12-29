import { useEffect, useState } from "react";
import { getAllOrders } from "../../services/orderService";
import { FaSearch, FaFilter, FaEye, FaBoxOpen } from "react-icons/fa";
import { Link } from "react-router-dom";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Filtering
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    const customerName = order.address?.name || "Guest";
    const matchesSearch =
      order.id.toString().includes(searchTerm) ||
      customerName.toLowerCase().includes(searchLower);
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      PACKED: "bg-purple-100 text-purple-800 border-purple-200", // "Ready" state
      "Out for Delivery": "bg-blue-100 text-blue-800 border-blue-200",
      Delivered: "bg-green-100 text-green-800 border-green-200",
      Cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) return <div className="p-8 text-center">Loading orders...</div>;

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Order Management
      </h2>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex gap-4 justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search Order ID or Customer Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="relative">
          <FaFilter className="absolute left-3 top-3 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="PACKED">Packed (Ready)</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 uppercase text-sm font-semibold">
              <th className="py-4 px-6">Order ID</th>
              <th className="py-4 px-6">Customer</th>
              <th className="py-4 px-6 text-center">Payment</th>
              <th className="py-4 px-6 text-center">Status</th>
              <th className="py-4 px-6 text-center">Items</th>
              <th className="py-4 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {filteredOrders.map((order) => (
              <tr
                key={order.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="py-4 px-6 font-mono font-bold text-blue-600">
                  #{order.id}
                </td>
                <td className="py-4 px-6 font-medium">
                  {order.address?.name || "Guest"}
                </td>

                {/* Payment Column */}
                <td className="py-4 px-6 text-center">
                  <span
                    className={`px-3 py-1 rounded text-xs font-bold ${
                      order.paymentMethod === "COD"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {order.paymentMethod === "COD" ? "COD" : "Online"}
                  </span>
                </td>

                {/* Status Column */}
                <td className="py-4 px-6 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </td>

                {/* Items Count */}
                <td className="py-4 px-6 text-center font-bold">
                  {order.OrderItems?.length || 0}
                </td>

                {/* Action Column */}
                <td className="py-4 px-6 text-right">
                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition"
                  >
                    <FaEye /> View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="p-10 text-center text-gray-400 flex flex-col items-center">
            <FaBoxOpen size={40} className="mb-3 opacity-50" />
            No orders found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
