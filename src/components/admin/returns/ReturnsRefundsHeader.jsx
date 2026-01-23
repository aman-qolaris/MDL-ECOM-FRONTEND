import {
  FaArrowLeft,
  FaBoxOpen,
  FaExchangeAlt,
  FaMoneyBillWave,
} from "react-icons/fa";

const ReturnsRefundsHeader = ({ activeTab, onTabChange, onBack }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 text-gray-600 transition shadow-sm"
        >
          <FaArrowLeft size={16} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaBoxOpen className="text-blue-600" /> Returns & Refunds
        </h1>
      </div>

      <div className="bg-white p-1 rounded-lg border border-gray-200 flex shadow-sm">
        <button
          onClick={() => onTabChange("returns")}
          className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition ${
            activeTab === "returns"
              ? "bg-blue-100 text-blue-700"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <FaExchangeAlt /> Returns
        </button>
        <button
          onClick={() => onTabChange("refunds")}
          className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition ${
            activeTab === "refunds"
              ? "bg-red-100 text-red-700"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <FaMoneyBillWave /> Cancellations
        </button>
      </div>
    </div>
  );
};

export default ReturnsRefundsHeader;
