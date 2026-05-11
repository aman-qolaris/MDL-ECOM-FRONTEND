import { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaPlus,
  FaSave,
  FaTrash,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
  FaPowerOff,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminShippingRates = () => {
  const navigate = useNavigate();
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [filter, setFilter] = useState("ALL"); // "ALL", "ACTIVE", "INACTIVE"

  // Form State
  const [areaName, setAreaName] = useState("");
  const [rateValue, setRateValue] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchRates();
  }, []);

  // ==========================================
  // API CALLS
  // ==========================================
  const fetchRates = async () => {
    try {
      setLoading(true);
      // Fetch all rates (backend returns all sorted by areaName)
      const { data } = await api.get("/orders/shipping/shipping-rates");
      setRates(data);
    } catch (error) {
      console.error("Failed to fetch shipping rates:", error);
      toast.error("Failed to load shipping rates");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRate = async (e) => {
    e.preventDefault();
    if (!areaName.trim() || rateValue === "") {
      return toast.warning("Please enter area name and rate.");
    }

    try {
      // Backend POST handles both Create and Update (Upsert based on areaName)
      await api.post("/orders/shipping/shipping-rates", {
        areaName: areaName.trim(),
        rate: Number(rateValue),
        isActive: isActive,
      });

      toast.success(
        isEditing ? "Shipping Rate Updated!" : "New Shipping Rate Added!",
      );
      resetForm();
      fetchRates();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save rate");
    }
  };

  const handleDelete = async (id) => {
    if (
      !globalThis.confirm("Are you sure you want to delete this shipping rate?")
    )
      return;

    try {
      await api.delete(`/orders/shipping/shipping-rates/${id}`);
      toast.success("Rate deleted successfully");
      fetchRates();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete rate");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const { data } = await api.patch(
        `/orders/shipping/shipping-rates/${id}/status`,
      );
      toast.success(data.message);
      fetchRates();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to toggle status");
    }
  };

  // ==========================================
  // UI HANDLERS
  // ==========================================
  const handleEditClick = (rate) => {
    setAreaName(rate.areaName);
    setRateValue(rate.rate);
    setIsActive(rate.isActive);
    setIsEditing(true);
    globalThis.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setAreaName("");
    setRateValue("");
    setIsActive(true);
    setIsEditing(false);
  };

  const displayedRates = useMemo(() => {
    if (filter === "ACTIVE") return rates.filter((r) => r.isActive);
    if (filter === "INACTIVE") return rates.filter((r) => !r.isActive);
    return rates;
  }, [rates, filter]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 text-gray-600 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <FaArrowLeft size={16} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaMapMarkerAlt className="text-blue-600" /> Shipping Rates Management
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ========================================== */}
        {/* LEFT COLUMN: FORM */}
        {/* ========================================== */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FaPlus
                className={isEditing ? "text-blue-600" : "text-green-600"}
              />
              {isEditing ? "Update Area" : "Add New Area"}
            </h2>

            <form onSubmit={handleSaveRate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  disabled={isEditing} // Prevent changing area name while editing to avoid duplicate entries
                  placeholder="e.g., Amanaka, Civil Lines"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isEditing ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  required
                />
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-1">
                    Area name cannot be changed during edit.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Charge (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 font-medium">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={rateValue}
                    onChange={(e) => setRateValue(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full p-2 pl-7 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 pb-4">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                <label
                  htmlFor="isActiveToggle"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Area is Active (Customers can select this)
                </label>
              </div>

              <div className="flex gap-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className={`flex-1 text-white py-2 rounded-lg font-bold transition flex items-center justify-center gap-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${isEditing ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}
                >
                  <FaSave /> {isEditing ? "Update Rate" : "Save Rate"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN: TABLE & FILTERS */}
        {/* ========================================== */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Filter Header */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                Existing Rates{" "}
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {displayedRates.length}
                </span>
              </h3>

              {/* Toggles */}
              <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden text-sm font-medium">
                <button
                  type="button"
                  onClick={() => setFilter("ALL")}
                  className={`px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 ${filter === "ALL" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("ACTIVE")}
                  className={`px-4 py-2 border-l border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-300 ${filter === "ACTIVE" ? "bg-green-600 text-white border-green-600" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("INACTIVE")}
                  className={`px-4 py-2 border-l border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 ${filter === "INACTIVE" ? "bg-gray-600 text-white border-gray-600" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  Inactive
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : displayedRates.length === 0 ? (
              <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                <FaMapMarkerAlt size={40} className="text-gray-300 mb-3" />
                <p>No shipping areas found for this filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                    <tr>
                      <th className="p-4 font-semibold">Area Name</th>
                      <th className="p-4 font-semibold text-right">Charge</th>
                      <th className="p-4 font-semibold text-center">Status</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {displayedRates.map((rate) => (
                      <tr key={rate.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 font-medium text-gray-800">
                          {rate.areaName}
                        </td>
                        <td className="p-4 font-bold text-gray-900 text-right">
                          ₹{rate.rate}
                        </td>
                        <td className="p-4 text-center">
                          {rate.isActive ? (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold">
                              <FaCheckCircle size={10} /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-bold">
                              <FaTimesCircle size={10} /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="p-4 flex justify-end gap-2">
                          {/* Toggle Status Action */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(rate.id)}
                            title={
                              rate.isActive
                                ? "Deactivate Area"
                                : "Activate Area"
                            }
                            className={`p-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-gray-300 ${rate.isActive ? "bg-orange-50 text-orange-600 hover:bg-orange-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                          >
                            <FaPowerOff size={14} />
                          </button>

                          {/* Edit Action */}
                          <button
                            type="button"
                            onClick={() => handleEditClick(rate)}
                            title="Edit Rate"
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                          >
                            <FaEdit size={14} />
                          </button>

                          {/* Delete Action */}
                          <button
                            type="button"
                            onClick={() => handleDelete(rate.id)}
                            title="Delete Area"
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition focus:outline-none focus:ring-2 focus:ring-red-300"
                          >
                            <FaTrash size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminShippingRates;
