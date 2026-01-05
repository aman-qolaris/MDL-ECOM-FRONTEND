import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAdminVendorSales } from "../../services/orderService";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaChartLine,
  FaRupeeSign,
  FaStore,
} from "react-icons/fa";

const AdminVendorSales = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();

  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);

  // ✅ Default to "all" so you immediately see data if it exists
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchSalesData();
  }, [vendorId, filter]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const data = await getAdminVendorSales(vendorId, filter);
      setTotalSales(data.totalSales || 0);
    } catch (error) {
      console.error("Failed to fetch sales data:", error);
      setTotalSales(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading sales analytics...</div>;

  return (
    <div className="animate-fadeIn p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/vendors")} // Adjust path if needed (e.g. /admin/inventory)
            className="p-2 rounded-full hover:bg-gray-200 transition"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaChartLine className="text-blue-600" /> Vendor Sales Report
            </h2>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <FaStore /> Vendor ID:{" "}
              <span className="font-mono font-bold">#{vendorId}</span>
            </p>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
          <FaCalendarAlt className="text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent outline-none text-gray-700 font-medium cursor-pointer"
          >
            {/* ✅ "All Time" Option Added */}
            <option value="all">All Time</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
            <option value="yearly">This Year</option>
          </select>
        </div>
      </div>

      {/* Sales Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-xl shadow-blue-200 transform hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-blue-100 text-lg">
              Total Revenue
            </h3>
            <div className="bg-white/20 p-2 rounded-lg">
              <FaRupeeSign className="text-2xl text-white" />
            </div>
          </div>
          <p className="text-5xl font-bold tracking-tight">
            ₹{totalSales.toLocaleString()}
          </p>
          <p className="mt-4 text-sm text-blue-200">
            * Validated sales from delivered orders only.
          </p>
        </div>

        {/* Info / Placeholder Card */}
        <div className="bg-gray-50 rounded-2xl p-8 border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
          <p className="text-gray-400 font-bold mb-2">Detailed Breakdown</p>
          <p className="text-gray-500 text-sm">
            Currently viewing{" "}
            <strong>{filter === "all" ? "All Time" : filter}</strong> sales.
            <br />
            Product-wise breakdown requires extended backend analytics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminVendorSales;
