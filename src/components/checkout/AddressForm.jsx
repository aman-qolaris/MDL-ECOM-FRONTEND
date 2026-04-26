import { useState, useEffect } from "react";
import { useSelector } from "react-redux"; // 🟢 CHANGED: Import Redux Hook
import { getDeliveryLocations } from "../../services/orderService";

const AddressForm = ({ onSubmit, initialData, buttonText, onAreaChange }) => {
  // 🟢 CHANGED: Get Logged-in User Data
  const { user } = useSelector((state) => state.auth);

  // 🔒 HARDCODED DEFAULTS (As per your "Raipur" specific logic)
  const FIXED_CITY = "Raipur";
  const FIXED_STATE = "Chhattisgarh";

  const [formData, setFormData] = useState({
    fullName: user?.name || "", // 🟢 CHANGED: Use user.name
    phone: user?.phone || "", // 🟢 CHANGED: Use user.phone
    addressLine1: initialData?.addressLine1 || "",
    city: FIXED_CITY,
    state: FIXED_STATE,
    area: initialData?.area || "",
  });

  const [availableAreas, setAvailableAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(true);

  // 🟢 NEW: Sync User Data if it loads after component mount
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  // 🟢 Fetch Delivery Areas on Component Mount
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await getDeliveryLocations();
        const activeAreaNames = data.map((item) => item.areaName);
        setAvailableAreas(activeAreaNames);
      } catch (error) {
        console.error("Failed to load areas", error);
      } finally {
        setLoadingAreas(false);
      }
    };

    fetchAreas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    if (name === "area" && onAreaChange) {
      onAreaChange(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation
    if (!formData.fullName || !formData.addressLine1 || !formData.area) {
      alert("Please select a Delivery Area and fill the address.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 🔒 LOCKED: Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            readOnly
            className="w-full border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed rounded-lg px-4 py-2 outline-none"
            title="Name is locked to your profile"
          />
        </div>

        {/* 🔒 LOCKED: Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            readOnly
            className="w-full border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed rounded-lg px-4 py-2 outline-none"
            title="Phone is locked to your profile"
          />
        </div>

        {/* ✏️ EDITABLE: Address Line 1 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address Line 1 <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Flat, House no., Building, Company, Apartment"
            required
          />
        </div>

        {/* 🔽 NEW DROPDOWN: Delivery Area */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Area <span className="text-red-500">*</span>
          </label>
          <select
            name="area"
            value={formData.area}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            required
          >
            <option value="">-- Select Your Area --</option>
            {loadingAreas ? (
              <option disabled>Loading areas...</option>
            ) : (
              availableAreas.map((area, idx) => (
                <option key={idx} value={area}>
                  {area}
                </option>
              ))
            )}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            * Select your area to help us assign the fastest delivery partner.
          </p>
        </div>

        {/* 🔒 LOCKED: City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            readOnly
            className="w-full border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed rounded-lg px-4 py-2 outline-none"
          />
        </div>

        {/* 🔒 LOCKED: State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            readOnly
            className="w-full border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed rounded-lg px-4 py-2 outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-sm mt-4"
      >
        {buttonText || "Continue to Payment"}
      </button>
    </form>
  );
};

export default AddressForm;
