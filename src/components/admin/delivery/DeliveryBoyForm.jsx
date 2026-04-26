/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  FaPlus,
  FaEye,
  FaEyeSlash,
  FaTimes,
  FaChevronDown,
} from "react-icons/fa";
import {
  addDeliveryBoy,
  getDeliveryLocations,
} from "../../../services/orderService";

const DeliveryBoyForm = ({ onBoyAdded }) => {
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [city] = useState("Raipur");
  const [state] = useState("Chhattisgarh");
  const [maxOrders, setMaxOrders] = useState(20);

  const [assignedAreas, setAssignedAreas] = useState([]); // Now an array
  const [availableAreas, setAvailableAreas] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await getDeliveryLocations();
        // data is now an array of objects: [{ areaName: "Amanaka", rate: 50 }, ...]
        const activeAreaNames = data.map((item) => item.areaName);
        setAvailableAreas(activeAreaNames);
      } catch (error) {
        console.error("Failed to load areas for delivery boy form", error);
      }
    };
    fetchAreas();
  }, []);

  const toggleAreaSelection = (area) => {
    if (assignedAreas.includes(area)) {
      setAssignedAreas(assignedAreas.filter((a) => a !== area));
    } else {
      setAssignedAreas([...assignedAreas, area]);
    }
  };

  const removeArea = (areaToRemove) => {
    setAssignedAreas(assignedAreas.filter((a) => a !== areaToRemove));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(newPhone)) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    if (assignedAreas.length === 0) {
      alert("Please assign at least one delivery area.");
      return;
    }

    const payload = {
      name: newName,
      phone: newPhone,
      email: newEmail,
      password: newPassword,
      city,
      state,
      maxOrders: parseInt(maxOrders),
      assignedAreas: assignedAreas,
    };

    try {
      const response = await addDeliveryBoy(payload);

      // Reset Form
      setNewName("");
      setNewPhone("");
      setNewEmail("");
      setNewPassword("");
      setAssignedAreas([]); // Reset to empty array
      setMaxOrders(20);
      setIsDropdownOpen(false);
      alert("Delivery Partner Registered Successfully!");

      if (onBoyAdded) {
        onBoyAdded(response.deliveryBoy);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add delivery boy. Check if Email/Phone already exists.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
      <h3 className="font-semibold text-lg mb-4 text-gray-800 border-b border-gray-100 pb-3">
        Register New Delivery Partner
      </h3>
      <form
        onSubmit={handleAdd}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            required
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="john@example.com"
            required
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Temporary Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full border border-gray-300 p-2.5 rounded-lg pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Create a password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              +91
            </span>
            <input
              type="text"
              placeholder="9876543210"
              required
              maxLength="10"
              pattern="\d{10}"
              className="w-full border border-gray-300 p-2.5 rounded-r-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ""))}
            />
          </div>
        </div>

        {/* City (Locked) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 p-2.5 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
            value={city}
            disabled
          />
        </div>

        {/* Max Orders */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Daily Orders
          </label>
          <input
            type="number"
            min="1"
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={maxOrders}
            onChange={(e) => setMaxOrders(e.target.value)}
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assigned Delivery Areas <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            {/* Custom Input Field displaying selected pills */}
            <div
              className="min-h-[46px] w-full border border-gray-300 p-2 rounded-lg cursor-pointer bg-white flex flex-wrap gap-2 items-center pr-10"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {assignedAreas.length === 0 ? (
                <span className="text-gray-400 pl-1 text-sm">
                  Select assigned areas...
                </span>
              ) : (
                assignedAreas.map((area) => (
                  <span
                    key={area}
                    className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs px-2.5 py-1 rounded-md"
                  >
                    {area}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeArea(area);
                      }}
                      className="hover:text-red-500 transition-colors"
                    >
                      <FaTimes size={10} />
                    </button>
                  </span>
                ))
              )}
              <FaChevronDown
                className={`absolute right-3 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                size={12}
              />
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
                {availableAreas.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500 text-center italic">
                    No active areas found. Add them in Shipping Rates.
                  </div>
                ) : (
                  availableAreas.map((area) => (
                    <label
                      key={area}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 border-b border-gray-50 last:border-none transition-colors ${assignedAreas.includes(area) ? "bg-blue-50/50" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={assignedAreas.includes(area)}
                        onChange={() => toggleAreaSelection(area)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {area}
                      </span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            Select the specific areas this partner is responsible for delivering
            to.
          </p>
        </div>

        <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-2 pt-4 border-t border-gray-100">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
          >
            <FaPlus size={14} /> Register Partner
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeliveryBoyForm;
