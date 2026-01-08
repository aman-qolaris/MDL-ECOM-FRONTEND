import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBoxOpen,
  FaCheckCircle,
  FaSignOutAlt,
  FaSpinner,
  FaMotorcycle,
  FaCalendarAlt,
  FaFilter,
} from "react-icons/fa";
import {
  getDeliveryTasks,
  updateDeliveryStatus,
} from "../../services/orderService";

const DeliveryDashboard = () => {
  // --- State ---
  const [tasks, setTasks] = useState({ active: [], history: [] });
  const [activeTab, setActiveTab] = useState("active"); // 'active' or 'history'
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'today', 'week'
  const [historyFilterType, setHistoryFilterType] = useState("date"); // 'date', 'range'
  const [historyDate, setHistoryDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const navigate = useNavigate();
  const deliveryBoy = JSON.parse(localStorage.getItem("deliveryBoy") || "{}");

  // --- Effects ---
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await getDeliveryTasks();
      // Handle response structure (expecting { active: [], history: [] })
      if (Array.isArray(data)) {
        setTasks({ active: data, history: [] });
      } else {
        setTasks(data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks", error);
      if (error.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("deliveryToken");
    localStorage.removeItem("deliveryBoy");
    navigate("/delivery/login");
  };

  const handleStatusUpdate = async (assignmentId, newStatus) => {
    if (!window.confirm(`Mark this order as ${newStatus}?`)) return;
    try {
      await updateDeliveryStatus(assignmentId, newStatus);
      fetchTasks(); // Refresh data
    } catch (error) {
      alert("Failed to update status");
    }
  };

  // --- Filtering Logic ---
  const getFilteredTasks = () => {
    const list = activeTab === "active" ? tasks.active : tasks.history;

    return list.filter((task) => {
      const taskDate = new Date(task.createdAt || task.updatedAt);
      const today = new Date();

      // Helper: Check if same day
      const isSameDay = (d1, d2) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

      // 1. ACTIVE FILTERS
      if (activeTab === "active") {
        if (activeFilter === "today") {
          return isSameDay(taskDate, today);
        }
        if (activeFilter === "week") {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(today.getDate() - 7);
          return taskDate >= oneWeekAgo && taskDate <= today;
        }
        return true; // 'all'
      }

      // 2. HISTORY FILTERS
      if (activeTab === "history") {
        if (historyFilterType === "date") {
          return isSameDay(taskDate, new Date(historyDate));
        }
        if (historyFilterType === "range") {
          const start = new Date(dateRange.start);
          const end = new Date(dateRange.end);
          end.setHours(23, 59, 59); // Include full end day
          return taskDate >= start && taskDate <= end;
        }
      }
      return true;
    });
  };

  const filteredList = getFilteredTasks();

  if (loading)
    return (
      <div className="flex h-screen justify-center items-center text-green-600 bg-gray-50">
        <FaSpinner className="animate-spin text-4xl" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      {/* --- Header --- */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaMotorcycle className="text-green-600" /> Delivery Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Welcome back,{" "}
              <span className="font-semibold text-gray-700">
                {deliveryBoy.name}
              </span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full transition-colors text-sm font-bold"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>

        {/* --- Tabs --- */}
        <div className="max-w-7xl mx-auto px-4 mt-2 flex gap-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-3 text-sm font-bold transition-colors border-b-2 ${
              activeTab === "active"
                ? "text-green-600 border-green-500"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            Active Orders ({tasks.active.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 text-sm font-bold transition-colors border-b-2 ${
              activeTab === "history"
                ? "text-blue-600 border-blue-500"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            History ({tasks.history.length})
          </button>
        </div>
      </header>

      {/* --- Filter Bar --- */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-bold uppercase tracking-wider">
            <FaFilter /> Filters:
          </div>

          {activeTab === "active" ? (
            <div className="flex bg-gray-100 rounded-lg p-1">
              {["all", "today", "week"].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeFilter === f
                      ? "bg-white text-green-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {f === "all"
                    ? "All Active"
                    : f === "today"
                    ? "Today"
                    : "This Week"}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4">
              {/* Type Selector */}
              <select
                value={historyFilterType}
                onChange={(e) => setHistoryFilterType(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-sm rounded-md px-3 py-2 outline-none focus:border-blue-500"
              >
                <option value="date">Specific Date</option>
                <option value="range">Date Range</option>
              </select>

              {/* Date Inputs */}
              {historyFilterType === "date" ? (
                <input
                  type="date"
                  value={historyDate}
                  onChange={(e) => setHistoryDate(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                    className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md px-3 py-1.5 outline-none"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                    className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md px-3 py-1.5 outline-none"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- Table Content --- */}
      <main className="max-w-7xl mx-auto px-4 pb-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Address</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  {activeTab === "active" && (
                    <th className="px-6 py-4 text-center">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {filteredList.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FaBoxOpen size={32} className="opacity-20" />
                        <p>No orders found for this filter.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredList.map((task) => {
                    const order = task.Order || {};
                    const address = order.address || {};
                    return (
                      <tr
                        key={task.assignmentId || task.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        {/* ID */}
                        <td className="px-6 py-4 font-mono font-medium text-gray-600">
                          #{order.id ? order.id.toString().slice(-6) : "N/A"}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-gray-500">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-gray-300" />
                            {new Date(
                              task.createdAt || task.updatedAt
                            ).toLocaleDateString()}
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(
                              task.createdAt || task.updatedAt
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-800">
                            {address.fullName || "Guest"}
                          </p>
                          <a
                            href={`tel:${address.phone}`}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            {address.phone}
                          </a>
                        </td>

                        {/* Address */}
                        <td
                          className="px-6 py-4 max-w-xs truncate"
                          title={`${address.addressLine1}, ${address.area}, ${address.city}`}
                        >
                          {address.addressLine1}, {address.area}, {address.city}
                          <div className="text-xs text-gray-400">
                            {address.state}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-800">
                            ₹{order.amount}
                          </span>
                          <span
                            className={`block text-[10px] font-bold px-2 py-0.5 rounded w-fit mt-1 ${
                              order.paymentMethod === "COD"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {order.paymentMethod}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <StatusBadge
                            status={task.status || task.assignmentStatus}
                          />
                        </td>

                        {/* Action Buttons (Only for Active Tab) */}
                        {activeTab === "active" && (
                          <td className="px-6 py-4 text-center">
                            {(task.status === "ASSIGNED" ||
                              task.assignmentStatus === "ASSIGNED") && (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(
                                    task.assignmentId || task.id,
                                    "PICKED"
                                  )
                                }
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded shadow-sm text-xs font-bold transition-transform active:scale-95 flex items-center gap-2 mx-auto"
                              >
                                <FaBoxOpen /> Pick Order
                              </button>
                            )}
                            {(task.status === "PICKED" ||
                              task.assignmentStatus === "PICKED" ||
                              task.status === "OUT_FOR_DELIVERY") && (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(
                                    task.assignmentId || task.id,
                                    "DELIVERED"
                                  )
                                }
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-sm text-xs font-bold transition-transform active:scale-95 flex items-center gap-2 mx-auto"
                              >
                                <FaCheckCircle /> Deliver
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Helper Components ---
const StatusBadge = ({ status }) => {
  const styles = {
    ASSIGNED: "bg-blue-100 text-blue-800 border-blue-200",
    PICKED: "bg-purple-100 text-purple-800 border-purple-200",
    OUT_FOR_DELIVERY: "bg-yellow-100 text-yellow-800 border-yellow-200",
    DELIVERED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border ${
        styles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status?.replace(/_/g, " ")}
    </span>
  );
};

export default DeliveryDashboard;
