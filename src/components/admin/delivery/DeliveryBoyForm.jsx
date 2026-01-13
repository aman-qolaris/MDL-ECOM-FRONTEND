/* eslint-disable react/prop-types */
import { useState } from "react";
import { FaPlus, FaEye, FaEyeSlash } from "react-icons/fa";
import { addDeliveryBoy } from "../../../services/orderService";

const DeliveryBoyForm = ({ onBoyAdded }) => {
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [city] = useState("Raipur");
  const [state] = useState("Chhattisgarh");
  const [maxOrders, setMaxOrders] = useState(20);
  const [assignedAreas, setAssignedAreas] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(newPhone)) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    const areaArray = assignedAreas
      .split(",")
      .map((area) => area.trim())
      .filter((area) => area !== "");

    const payload = {
      name: newName,
      phone: newPhone,
      email: newEmail,
      password: newPassword,
      city,
      state,
      maxOrders: parseInt(maxOrders),
      assignedAreas: areaArray,
    };

    try {
      const addedBoy = await addDeliveryBoy(payload);

      // Reset Form
      setNewName("");
      setNewPhone("");
      setNewEmail("");
      setNewPassword("");
      setAssignedAreas("");
      setMaxOrders(20);
      alert("Delivery Partner Registered Successfully!");

      if (onBoyAdded) {
        onBoyAdded(addedBoy);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add delivery boy. Check if Email/Phone already exists.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
      <h3 className="font-semibold text-lg mb-4 text-gray-700 border-b pb-2">
        Register New Delivery Partner
      </h3>
      <form
        onSubmit={handleAdd}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Name
          </label>
          <input
            type="text"
            placeholder="Name"
            required
            className="w-full border p-2 rounded mt-1"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter email"
            required
            className="w-full border p-2 rounded mt-1"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Password
          </label>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full border p-2 rounded pr-10"
              placeholder="Create a password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Phone
          </label>
          <input
            type="text"
            placeholder="Phone"
            required
            maxLength="10"
            pattern="\d{10}"
            className="w-full border p-2 rounded mt-1"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ""))}
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-600">
            City
          </label>
          <input
            type="text"
            className="w-full border p-2 rounded mt-1 bg-gray-100 cursor-not-allowed"
            value={city}
            disabled
          />
        </div>

        {/* Max Orders */}
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Max Daily Orders
          </label>
          <input
            type="number"
            min="1"
            className="w-full border p-2 rounded mt-1"
            value={maxOrders}
            onChange={(e) => setMaxOrders(e.target.value)}
          />
        </div>

        {/* Areas */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-600">
            Assigned Areas (Comma Separated)
          </label>
          <textarea
            className="w-full border p-2 rounded mt-1"
            rows="2"
            placeholder="e.g. Vijay Nagar, Palasia..."
            value={assignedAreas}
            onChange={(e) => setAssignedAreas(e.target.value)}
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3 flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow flex items-center gap-2 cursor-pointer"
          >
            <FaPlus /> Register Delivery Boy
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeliveryBoyForm;
