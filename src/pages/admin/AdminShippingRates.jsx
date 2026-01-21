import { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import { getDeliveryLocations } from "../../services/orderService";
import useDebounce from "../../hooks/useDebounce";
import { toast } from "react-toastify";
import { FaMapMarkerAlt, FaPlus, FaSave, FaSearch } from "react-icons/fa";

const AdminShippingRates = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newRate, setNewRate] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  // Search/Dropdown State
  const [searchTerm, setSearchTerm] = useState("");
  const [availableAreas, setAvailableAreas] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Fetch Data
  useEffect(() => {
    fetchRates();
    fetchLocations();
  }, []);

  const fetchRates = async () => {
    try {
      const { data } = await api.get("/orders/shipping/shipping-rates");
      setRates(data);
    } catch (error) {
      toast.error("Failed to load shipping rates");
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const data = await getDeliveryLocations();
      const flatAreas = new Set();
      if (data) {
        Object.values(data).forEach((cities) => {
          Object.values(cities).forEach((areas) => {
            if (Array.isArray(areas)) {
              areas.forEach((area) => flatAreas.add(area));
            }
          });
        });
      }
      setAvailableAreas([...flatAreas].sort());
    } catch (error) {
      console.error("Location Fetch Error", error);
    }
  };

  const filteredOptions = useMemo(() => {
    if (!debouncedSearch) return [];
    return availableAreas.filter((area) =>
      area.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [debouncedSearch, availableAreas]);

  const handleSelectArea = (area) => {
    setSelectedArea(area);
    setSearchTerm(area);
    setShowDropdown(false);
  };

  const handleSaveRate = async (e) => {
    e.preventDefault();
    if (!selectedArea || !newRate)
      return toast.warning("Please select area and enter rate");

    try {
      await api.post("/orders/shipping/shipping-rates", {
        areaName: selectedArea,
        rate: newRate,
      });
      toast.success("Shipping Rate Saved!");
      setSelectedArea("");
      setSearchTerm("");
      setNewRate("");
      fetchRates();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save rate");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaMapMarkerAlt className="text-blue-600" /> Shipping Rates Management
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Add New Rate Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FaPlus className="text-green-600" /> Add / Update Area
            </h2>
            <form onSubmit={handleSaveRate} className="space-y-4">
              {/* Searchable Dropdown */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Available Area
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                      if (selectedArea && e.target.value !== selectedArea) {
                        setSelectedArea("");
                      }
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Type to search area..."
                    className="w-full p-2 pl-9 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400 text-sm" />
                </div>

                {showDropdown && searchTerm && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                    {filteredOptions.length > 0 ? (
                      filteredOptions.map((area, idx) => (
                        <li
                          key={idx}
                          onClick={() => handleSelectArea(area)}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-none"
                        >
                          {area}
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-3 text-sm text-gray-400 text-center italic">
                        No active delivery areas match "{searchTerm}"
                      </li>
                    )}
                  </ul>
                )}

                {selectedArea && (
                  <p className="text-xs text-green-600 mt-1 font-medium flex items-center gap-1">
                    ✓ Selected: {selectedArea}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Charge (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full p-2 pl-7 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-md"
              >
                <FaSave /> Save Rate
              </button>
            </form>
          </div>
        </div>

        {/* Right: Existing Rates List (ACTIONS REMOVED) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">
                Existing Rates ({rates.length})
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : rates.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No shipping rates configured yet.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                  <tr>
                    <th className="p-4 font-semibold">Area Name</th>
                    <th className="p-4 font-semibold text-right">Charge</th>
                    {/* 🟢 REMOVED ACTION COLUMN */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rates.map((rate) => (
                    <tr key={rate.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-medium text-gray-800">
                        {rate.areaName}
                      </td>
                      <td className="p-4 font-bold text-green-700 text-right">
                        ₹{rate.rate}
                      </td>
                      {/* 🟢 REMOVED ACTION BUTTONS */}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminShippingRates;
