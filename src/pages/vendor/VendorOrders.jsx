import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getVendorOrders } from "../../services/orderService";
import { FaBoxOpen, FaEye, FaSearch, FaFilter } from "react-icons/fa";

const VendorOrders = () => {
  const [orders, setOrders] = useState([]); // Stores Grouped Orders
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // 1. Fetch all items assigned to this vendor
      const items = await getVendorOrders();

      // 2. Group items by Order ID to create "Orders" view
      const ordersMap = new Map();

      items.forEach((item) => {
        if (!ordersMap.has(item.orderId)) {
          ordersMap.set(item.orderId, {
            id: item.orderId,
            customerName: "Customer", // Ideally fetched from backend or available in item
            status: item.Order?.status || "Pending", // Top level order status
            items: [],
            totalPrice: 0,
            date: item.createdAt,
          });
        }
        const order = ordersMap.get(item.orderId);
        order.items.push(item);
        order.totalPrice += item.price * item.quantity;
      });

      setOrders(Array.from(ordersMap.values()));
    } catch (error) {
      console.error("Error fetching vendor orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toString().includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      PACKED: "bg-purple-100 text-purple-800 border-purple-200",
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
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 max-w-md w-full">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="relative w-full md:w-auto">
          <FaFilter className="absolute left-3 top-3 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-48 pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="PACKED">Ready / Packed</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-10 text-center text-gray-400 flex flex-col items-center">
            <FaBoxOpen size={40} className="mb-3 opacity-50" />
            No orders found.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-sm font-semibold">
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6 text-center">My Items</th>
                <th className="py-4 px-6 text-center">Total Value</th>
                <th className="py-4 px-6 text-center">Order Status</th>
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
                  <td className="py-4 px-6 text-gray-500">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-center font-bold">
                    {order.items.length}
                  </td>
                  <td className="py-4 px-6 text-center">
                    ₹{order.totalPrice.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      to={`/vendor/orders/${order.id}`}
                      className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition"
                    >
                      <FaEye /> Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default VendorOrders;
