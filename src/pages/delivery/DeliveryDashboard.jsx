import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaBoxOpen } from "react-icons/fa";
import {
  getDeliveryTasks,
  updateDeliveryStatus,
} from "../../services/orderService";

// Components
import DeliveryHeader from "../../components/delivery/dashboard/DeliveryHeader";
import DeliveryFilters from "../../components/delivery/dashboard/DeliveryFilters";
import DeliveryTaskCard from "../../components/delivery/dashboard/DeliveryTaskCard";

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
      console.error(error);
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
      {/* Header with Tabs */}
      <DeliveryHeader
        deliveryBoy={deliveryBoy}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tasks={tasks}
        onLogout={handleLogout}
      />

      {/* Filter Bar */}
      <DeliveryFilters
        activeTab={activeTab}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        historyFilterType={historyFilterType}
        setHistoryFilterType={setHistoryFilterType}
        historyDate={historyDate}
        setHistoryDate={setHistoryDate}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      {/* Main List */}
      <main className="max-w-4xl mx-auto px-4 pb-10 space-y-4">
        {filteredList.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FaBoxOpen size={40} className="mx-auto mb-2 opacity-20" />
            <p>No tasks found for this filter.</p>
          </div>
        ) : (
          filteredList.map((task) => (
            <DeliveryTaskCard
              key={task.assignmentId || task.id}
              task={task}
              activeTab={activeTab}
              onStatusUpdate={handleStatusUpdate}
            />
          ))
        )}
      </main>
    </div>
  );
};

export default DeliveryDashboard;
