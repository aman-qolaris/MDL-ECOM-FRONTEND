import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaFilter, FaEye, FaBoxOpen } from "react-icons/fa";
import { getAllOrders } from "../../services/orderService";
import AdminTableSkeleton from "../../components/placeholders/AdminTableSkeleton";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scrollTop, setScrollTop] = useState(0);

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

  // Memoized Filter Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchLower = searchTerm.toLowerCase();
      const customerName = order.address?.fullName || "Guest";

      const matchesSearch =
        order.id.toString().includes(searchTerm) ||
        customerName.toLowerCase().includes(searchLower);

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Lightweight table windowing to avoid rendering huge <tbody>.
  const ROW_HEIGHT_PX = 72;
  const VIEWPORT_HEIGHT_PX = 560;
  const OVERSCAN = 8;
  const virtual = useMemo(() => {
    const total = filteredOrders.length;
    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT_PX) - OVERSCAN);
    const visibleCount = Math.ceil(VIEWPORT_HEIGHT_PX / ROW_HEIGHT_PX);
    const end = Math.min(total, start + visibleCount + OVERSCAN * 2);
    const paddingTop = start * ROW_HEIGHT_PX;
    const paddingBottom = Math.max(0, (total - end) * ROW_HEIGHT_PX);
    return { start, end, paddingTop, paddingBottom };
  }, [filteredOrders.length, scrollTop]);

  const visibleOrders = useMemo(
    () => filteredOrders.slice(virtual.start, virtual.end),
    [filteredOrders, virtual.start, virtual.end]
  );

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

  return (
    <div className="animate-fadeIn pb-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Order Management
      </h2>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full md:max-w-md">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search Order ID or Customer Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>

        <div className="relative w-full md:w-auto">
          <FaFilter className="absolute left-3 top-3 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer hover:border-blue-400 transition"
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

      {/* Table Content */}
      {loading ? (
        <AdminTableSkeleton rows={8} columns={6} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div
            className="overflow-x-auto overflow-y-auto"
            style={{ maxHeight: VIEWPORT_HEIGHT_PX }}
            onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          >
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6 text-center">Payment</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Items</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm">
                {filteredOrders.length > 0 ? (
                  <>
                    {virtual.paddingTop > 0 && (
                      <tr>
                        <td
                          colSpan="6"
                          style={{ height: virtual.paddingTop }}
                        />
                      </tr>
                    )}

                    {visibleOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b hover:bg-gray-50 transition duration-150"
                        style={{ height: ROW_HEIGHT_PX }}
                      >
                        <td className="py-4 px-6 font-mono font-bold text-blue-600">
                          #{order.id}
                        </td>
                        <td className="py-4 px-6 font-medium">
                          {order.address?.fullName || "Guest"}
                        </td>

                        <td className="py-4 px-6 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${
                              order.paymentMethod === "COD"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {order.paymentMethod === "COD" ? "COD" : "Online"}
                          </span>
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

                        <td className="py-4 px-6 text-center font-bold text-gray-500">
                          {order.OrderItems?.length || 0}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-2 bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-50 transition shadow-sm"
                          >
                            <FaEye /> Details
                          </Link>
                        </td>
                      </tr>
                    ))}

                    {virtual.paddingBottom > 0 && (
                      <tr>
                        <td
                          colSpan="6"
                          style={{ height: virtual.paddingBottom }}
                        />
                      </tr>
                    )}
                  </>
                ) : (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <FaBoxOpen size={48} className="mb-4 opacity-30" />
                        <p className="text-lg font-medium text-gray-500">
                          No orders found
                        </p>
                        <p className="text-sm">Try adjusting your filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
