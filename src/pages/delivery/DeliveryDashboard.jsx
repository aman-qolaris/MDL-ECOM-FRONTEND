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
  FaMapMarkerAlt, // New Icon
  FaUndo, // New Icon (For Returns)
  FaPhone, // New Icon
  FaRupeeSign, // New Icon
  FaWarehouse, // New Icon
} from "react-icons/fa";
import {
  getDeliveryTasks,
  updateDeliveryStatus,
} from "../../services/orderService";

const DeliveryDashboard = () => {
  // --- State ---
  const [tasks, setTasks] = useState({ active: [], history: [] });
  const [activeTab, setActiveTab] = useState("active");
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeFilter, setActiveFilter] = useState("all");
  const [historyFilterType, setHistoryFilterType] = useState("date");
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
    // Dynamic confirmation message based on action
    const actionName = newStatus === "PICKED" ? "Pick Up" : "Complete Job";
    if (!window.confirm(`Confirm ${actionName}?`)) return;

    try {
      await updateDeliveryStatus(assignmentId, newStatus);
      fetchTasks();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  // --- Filtering Logic (Preserved from your code) ---
  const getFilteredTasks = () => {
    const list = activeTab === "active" ? tasks.active : tasks.history;

    return list.filter((task) => {
      const taskDate = new Date(task.createdAt || task.updatedAt);
      const today = new Date();

      const isSameDay = (d1, d2) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

      if (activeTab === "active") {
        if (activeFilter === "today") return isSameDay(taskDate, today);
        if (activeFilter === "week") {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(today.getDate() - 7);
          return taskDate >= oneWeekAgo && taskDate <= today;
        }
        return true;
      }

      if (activeTab === "history") {
        if (historyFilterType === "date") {
          return isSameDay(taskDate, new Date(historyDate));
        }
        if (historyFilterType === "range") {
          const start = new Date(dateRange.start);
          const end = new Date(dateRange.end);
          end.setHours(23, 59, 59);
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
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaMotorcycle className="text-green-600" /> Delivery Panel
            </h1>
            <p className="text-xs text-gray-500">Hi, {deliveryBoy.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>

        {/* --- Tabs --- */}
        <div className="max-w-4xl mx-auto px-4 mt-2 flex gap-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-3 text-sm font-bold transition-colors border-b-2 ${
              activeTab === "active"
                ? "text-green-600 border-green-500"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            Active Tasks ({tasks.active.length})
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
      <div className="max-w-4xl mx-auto px-4 py-6">
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
                  {f === "all" ? "All" : f === "today" ? "Today" : "This Week"}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={historyFilterType}
                onChange={(e) => setHistoryFilterType(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-sm rounded-md px-3 py-2 outline-none"
              >
                <option value="date">Specific Date</option>
                <option value="range">Date Range</option>
              </select>
              {historyFilterType === "date" ? (
                <input
                  type="date"
                  value={historyDate}
                  onChange={(e) => setHistoryDate(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md px-3 py-1.5"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                    className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md px-3 py-1.5"
                  />
                  <span>-</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                    className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md px-3 py-1.5"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- NEW: Card View for Returns & Deliveries --- */}
      <main className="max-w-4xl mx-auto px-4 pb-10 space-y-4">
        {filteredList.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FaBoxOpen size={40} className="mx-auto mb-2 opacity-20" />
            <p>No tasks found for this filter.</p>
          </div>
        ) : (
          filteredList.map((task) => {
            // 🟢 Determine Type: Return or Delivery
            const isReturn = task.type === "RETURN_PICKUP";
            const address = task.address || {};
            const items = task.items || [];

            // Map Link
            const mapQuery = `${address.addressLine1}, ${address.city}, ${address.state}`;
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              mapQuery
            )}`;

            return (
              <div
                key={task.assignmentId || task.id}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden relative ${
                  isReturn
                    ? "border-l-4 border-l-red-500"
                    : "border-l-4 border-l-green-500"
                }`}
              >
                {/* Badge Type */}
                <div className="absolute top-3 right-3">
                  {isReturn ? (
                    <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-red-200">
                      <FaUndo /> Return Pickup
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-green-200">
                      <FaBoxOpen /> Delivery
                    </span>
                  )}
                </div>

                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-mono mb-2">
                    <span>#{task.orderId}</span>
                    <span>•</span>
                    <FaCalendarAlt />{" "}
                    {new Date(
                      task.createdAt || task.updatedAt
                    ).toLocaleDateString()}
                  </div>

                  {/* Customer & Cash */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        {task.customerName || address.fullName}
                      </h3>
                      <a
                        href={`tel:${task.phone || address.phone}`}
                        className="text-blue-600 text-sm flex items-center gap-1 font-medium hover:underline"
                      >
                        <FaPhone size={12} /> {task.phone || address.phone}
                      </a>
                    </div>

                    <div className="text-right">
                      {isReturn ? (
                        <span className="text-xs font-bold text-gray-400 uppercase">
                          Do Not Pay
                        </span>
                      ) : task.cashToCollect > 0 ? (
                        <div className="text-orange-600 font-bold flex flex-col items-end">
                          <span className="text-xs text-gray-500 font-normal">
                            Collect Cash
                          </span>
                          <span className="text-lg flex items-center">
                            <FaRupeeSign size={14} /> {task.cashToCollect}
                          </span>
                        </div>
                      ) : (
                        <span className="text-green-600 text-xs font-bold uppercase border border-green-200 px-2 py-1 rounded bg-green-50">
                          Prepaid
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Address & Map */}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4 flex justify-between items-center">
                    <div className="text-sm text-gray-600 w-3/4">
                      <p className="line-clamp-2">
                        {address.addressLine1}, {address.area}, {address.city}
                      </p>
                    </div>
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200 transition"
                    >
                      <FaMapMarkerAlt />
                    </a>
                  </div>

                  {/* Items List (Important for verifying Returns) */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                      Items to {isReturn ? "Verify & Pick" : "Deliver"}
                    </p>
                    <div className="space-y-1">
                      {items.length > 0 ? (
                        items.map((item, idx) => (
                          <div
                            key={idx}
                            className="text-sm text-gray-700 flex justify-between border-b border-gray-100 pb-1 last:border-0"
                          >
                            <span>
                              {item.Product?.name || "Product"}{" "}
                              <span className="text-gray-400">
                                x{item.quantity}
                              </span>
                            </span>
                            {isReturn && (
                              <span className="text-xs text-red-500 italic">
                                ({item.returnReason})
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          Item details not available
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {activeTab === "active" && (
                    <div className="grid grid-cols-1 gap-2">
                      {/* 1. Pick Up Phase */}
                      {(task.status === "ASSIGNED" ||
                        task.assignmentStatus === "ASSIGNED") && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(
                              task.assignmentId || task.id,
                              "PICKED"
                            )
                          }
                          className={`w-full py-3 rounded-lg font-bold text-white shadow-md flex justify-center items-center gap-2 transition-transform active:scale-95 ${
                            isReturn
                              ? "bg-orange-500 hover:bg-orange-600"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          {isReturn ? (
                            <>
                              <FaBoxOpen /> Pick from Customer
                            </>
                          ) : (
                            <>
                              <FaBoxOpen /> Pick from Seller/Warehouse
                            </>
                          )}
                        </button>
                      )}

                      {/* 2. Delivery Phase */}
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
                          className={`w-full py-3 rounded-lg font-bold text-white shadow-md flex justify-center items-center gap-2 transition-transform active:scale-95 ${
                            isReturn
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {isReturn ? (
                            <>
                              <FaWarehouse /> Drop at Warehouse
                            </>
                          ) : (
                            <>
                              <FaCheckCircle /> Deliver to Customer
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
};

export default DeliveryDashboard;
