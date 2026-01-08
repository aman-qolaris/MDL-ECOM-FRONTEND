import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBoxOpen,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSignOutAlt,
  FaSpinner,
  FaHistory,
  FaMotorcycle,
} from "react-icons/fa";
import {
  getDeliveryTasks,
  updateDeliveryStatus,
} from "../../services/orderService";

const DeliveryDashboard = () => {
  // Store data as an object with two arrays
  const [tasks, setTasks] = useState({ active: [], history: [] });
  const [activeTab, setActiveTab] = useState("active"); // 'active' or 'history'
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const deliveryBoy = JSON.parse(localStorage.getItem("deliveryBoy") || "{}");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await getDeliveryTasks();

      // Handle case where API might return array (old) or object (new)
      if (Array.isArray(data)) {
        setTasks({ active: data, history: [] });
      } else {
        setTasks(data); // Expecting { active: [], history: [] }
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
      fetchTasks(); // Refresh from server to move item from Active -> History
    } catch (error) {
      alert("Failed to update status");
    }
  };

  if (loading)
    return (
      <div className="flex h-screen justify-center items-center text-green-600 bg-gray-50">
        <FaSpinner className="animate-spin text-4xl" />
      </div>
    );

  // Helper to determine which list to show
  const currentList = activeTab === "active" ? tasks.active : tasks.history;

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-20">
      {/* --- Header --- */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaMotorcycle className="text-green-600" /> Dashboard
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Hello, {deliveryBoy.name}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-red-500 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-colors"
          >
            <FaSignOutAlt size={18} />
          </button>
        </div>

        {/* --- Tabs --- */}
        <div className="flex border-t border-gray-100">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-3 text-sm font-bold text-center transition-colors relative ${
              activeTab === "active"
                ? "text-green-600 bg-green-50/50"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            Active Tasks ({tasks.active.length})
            {activeTab === "active" && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 rounded-t-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 text-sm font-bold text-center transition-colors relative ${
              activeTab === "history"
                ? "text-blue-600 bg-blue-50/50"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            History ({tasks.history.length})
            {activeTab === "history" && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 rounded-t-full"></div>
            )}
          </button>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        {currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            {activeTab === "active" ? (
              <>
                <FaBoxOpen size={48} className="mb-3 opacity-30" />
                <p>No active tasks right now.</p>
              </>
            ) : (
              <>
                <FaHistory size={48} className="mb-3 opacity-30" />
                <p>No delivery history yet.</p>
              </>
            )}
          </div>
        ) : (
          currentList.map((task) => (
            <OrderCard
              key={task.assignmentId || task.id} // Handle fallback ID
              task={task}
              isHistory={activeTab === "history"}
              onUpdate={handleStatusUpdate}
            />
          ))
        )}
      </main>
    </div>
  );
};

// --- Refactored Card Component ---
const OrderCard = ({ task, isHistory, onUpdate }) => {
  // Use optional chaining carefully based on your backend response structure
  const order = task.Order || {};
  const address = order.address || {};

  return (
    <div
      className={`rounded-xl shadow-sm border overflow-hidden transition-all ${
        isHistory ? "bg-gray-50 border-gray-200" : "bg-white border-gray-100"
      }`}
    >
      {/* Card Header */}
      <div className="px-5 py-3 flex justify-between items-center border-b border-gray-100/50">
        <span className="font-mono text-xs font-bold text-gray-400">
          #{order.id}
        </span>
        <StatusBadge status={task.assignmentStatus || task.status} />
      </div>

      {/* Card Body */}
      <div className="p-5">
        {/* Customer Details */}
        <div className="mb-4">
          <h3
            className={`font-bold text-lg mb-1 ${
              isHistory ? "text-gray-600" : "text-gray-800"
            }`}
          >
            {address.fullName || "Customer"}
          </h3>

          <div className="flex items-start gap-2 text-gray-500 text-sm mb-1.5">
            <FaMapMarkerAlt className="mt-1 flex-shrink-0 text-green-500" />
            <p className="leading-snug">
              {address.addressLine1}, {address.area}
              <br />
              {address.city}
            </p>
          </div>

          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <FaPhoneAlt className="text-green-500 text-xs" />
            <a
              href={`tel:${address.phone}`}
              className="hover:text-green-600 hover:underline"
            >
              {address.phone}
            </a>
          </div>
        </div>

        {/* Payment & Amount */}
        <div
          className={`flex justify-between items-center p-3 rounded-lg mb-4 text-sm ${
            isHistory ? "bg-gray-100 text-gray-500" : "bg-blue-50 text-blue-800"
          }`}
        >
          <div>
            <span className="block text-xs opacity-70">Payment Method</span>
            <span className="font-bold">
              {order.paymentMethod === "COD"
                ? "Cash on Delivery"
                : "Online Paid"}
            </span>
          </div>
          <div className="text-right">
            <span className="block text-xs opacity-70">Amount</span>
            <span className="font-bold text-lg">₹{order.amount}</span>
          </div>
        </div>

        {/* Cash to Collect Warning (If needed from backend logic) */}
        {task.cashToCollect > 0 && isHistory && (
          <div className="mb-4 text-center text-xs bg-red-50 text-red-600 py-1 rounded border border-red-100">
            ⚠️ Cash not yet deposited to Admin
          </div>
        )}

        {/* Action Buttons (Active Only) */}
        {!isHistory && (
          <div className="grid grid-cols-1 gap-3">
            {(task.assignmentStatus === "ASSIGNED" ||
              task.status === "ASSIGNED") && (
              <button
                onClick={() => onUpdate(task.assignmentId || task.id, "PICKED")}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white py-3 rounded-lg font-bold shadow-md active:scale-95 transition-all flex justify-center items-center gap-2"
              >
                <FaBoxOpen /> Pick Order
              </button>
            )}

            {(task.assignmentStatus === "PICKED" ||
              task.assignmentStatus === "OUT_FOR_DELIVERY" ||
              task.status === "PICKED") && (
              <button
                onClick={() =>
                  onUpdate(task.assignmentId || task.id, "DELIVERED")
                }
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-lg font-bold shadow-md active:scale-95 transition-all flex justify-center items-center gap-2"
              >
                <FaCheckCircle /> Mark Delivered
              </button>
            )}
          </div>
        )}

        {/* History Details (History Only) */}
        {isHistory && (
          <div className="text-center pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Order completed
              {order.date
                ? ` on ${new Date(order.date).toLocaleDateString()}`
                : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Status Badge Helper
const StatusBadge = ({ status }) => {
  const config = {
    ASSIGNED: { color: "bg-blue-100 text-blue-700", label: "Pending Pickup" },
    PICKED: {
      color: "bg-orange-100 text-orange-700",
      label: "Out for Delivery",
    },
    OUT_FOR_DELIVERY: {
      color: "bg-orange-100 text-orange-700",
      label: "Out for Delivery",
    },
    DELIVERED: { color: "bg-green-100 text-green-700", label: "Delivered" },
    CANCELLED: { color: "bg-red-100 text-red-700", label: "Cancelled" },
    FAILED: { color: "bg-red-100 text-red-700", label: "Reassigned/Failed" },
  };

  const { color, label } = config[status] || {
    color: "bg-gray-100 text-gray-600",
    label: status,
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${color}`}
    >
      {label}
    </span>
  );
};

export default DeliveryDashboard;
