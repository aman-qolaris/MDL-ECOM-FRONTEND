import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api"; // Use your existing configured axios instance
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaChartLine,
  FaRupeeSign,
  FaBox,
} from "react-icons/fa";

const AdminVendorSales = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("month"); // Default to Month

  useEffect(() => {
    fetchSalesData();
  }, [vendorId, filter]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      // Calls the Gateway route we just made
      const response = await api.get(
        `/orders/analytics/vendor/${vendorId}?range=${filter}`
      );
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch sales data");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading sales analytics...</div>;
  if (!data) return <div className="p-8 text-center">No data available</div>;

  return (
    <div className="animate-fadeIn p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/inventory")}
            className="p-2 rounded-full hover:bg-gray-200 transition"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaChartLine className="text-blue-600" /> Vendor Sales Report
            </h2>
            <p className="text-sm text-gray-500">
              Period: <span className="font-semibold capitalize">{filter}</span>
              {filter !== "all" && " (Current)"}
            </p>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
          <FaCalendarAlt className="text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent outline-none text-gray-700 font-medium"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold opacity-90">Total Revenue</h3>
            <FaRupeeSign className="text-2xl opacity-80" />
          </div>
          <p className="text-4xl font-bold">
            ₹{data.totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-600">Total Items Sold</h3>
            <FaBox className="text-2xl text-blue-500" />
          </div>
          <p className="text-4xl font-bold text-gray-800">
            {data.totalItemsSold}
          </p>
        </div>
      </div>

      {/* Product Breakdown Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Product Breakdown</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
              <th className="py-4 px-6">Product</th>
              <th className="py-4 px-6 text-center">Qty Sold</th>
              <th className="py-4 px-6 text-right">Revenue Generated</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {data.breakdown.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <td className="py-4 px-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaBox className="w-full h-full p-2 text-gray-400" />
                    )}
                  </div>
                  <span className="font-medium">{item.name}</span>
                </td>
                <td className="py-4 px-6 text-center font-semibold">
                  {item.totalQty}
                </td>
                <td className="py-4 px-6 text-right text-green-600 font-bold">
                  ₹{item.totalRevenue.toLocaleString()}
                </td>
              </tr>
            ))}
            {data.breakdown.length === 0 && (
              <tr>
                <td colSpan="3" className="p-8 text-center text-gray-500">
                  No sales found for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminVendorSales;
