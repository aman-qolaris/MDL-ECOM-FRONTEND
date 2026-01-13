/* eslint-disable react/prop-types */
import { FaMotorcycle, FaSignOutAlt } from "react-icons/fa";

const DeliveryHeader = ({
  deliveryBoy,
  activeTab,
  setActiveTab,
  tasks,
  onLogout,
}) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaMotorcycle className="text-green-600" /> Delivery Panel
          </h1>
          <p className="text-xs text-gray-500">Hi, {deliveryBoy.name}</p>
        </div>
        <button
          onClick={onLogout}
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
  );
};

export default DeliveryHeader;
