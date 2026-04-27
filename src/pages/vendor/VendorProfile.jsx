import { useState, useEffect } from "react";
import { FaStore, FaUniversity, FaSave, FaUser } from "react-icons/fa";
import api from "../../services/api";

const VendorProfile = () => {
  const [loading, setLoading] = useState(true);

  // Initial State
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    businessAddress: "",
    gst: "",
    bankName: "",
    bankAccount: "",
    ifsc: "",
  });

  // Fetch Vendor Data on Page Load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("vendorToken");

        if (!token) {
          // If no token, we can't fetch.
          // (The Layout usually handles redirect, but good to be safe)
          setLoading(false);
          return;
        }

        const response = await api.get("/vendor/me");

        // 3. Map Backend Data to Frontend State
        const data = response.data;
        setProfile({
          name: data.name,
          email: data.email,
          phone: data.phone,
          businessName: data.businessName,
          businessAddress: data.businessAddress,
          gst: data.gstNumber,
          bankName: data.bankName,
          bankAccount: data.bankAccountNumber,
          ifsc: data.bankIFSC,
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Optional: specific handling for 403
        if (error.response && error.response.status === 403) {
          alert("Session expired or unauthorized. Please login again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    alert("Profile Update feature coming soon!");
  };

  if (loading) {
    return <div className="p-10 text-center">Loading Profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Business Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <FaStore className="text-purple-600" /> Business Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Owner Name
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  disabled
                  className="w-full border p-2 pl-10 rounded bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Shop Name
              </label>
              <input
                type="text"
                name="businessName"
                value={profile.businessName}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Email
              </label>
              <input
                type="text"
                value={profile.email}
                disabled
                className="w-full border p-2 rounded mt-1 bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Phone
              </label>
              <input
                type="text"
                value={profile.phone}
                disabled
                className="w-full border p-2 rounded mt-1 bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                GST Number
              </label>
              <input
                type="text"
                name="gst"
                value={profile.gst || "N/A"}
                disabled
                className="w-full border p-2 rounded mt-1 bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">
                Contact Admin to change GST
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600">
                Address
              </label>
              <textarea
                name="businessAddress"
                value={profile.businessAddress}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Card 2: Banking Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <FaUniversity className="text-purple-600" /> Banking Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={profile.bankName}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                IFSC Code
              </label>
              <input
                type="text"
                name="ifsc"
                value={profile.ifsc}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600">
                Account Number
              </label>
              <input
                type="text"
                name="bankAccount"
                value={profile.bankAccount}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
        >
          <FaSave /> Save Changes
        </button>
      </form>
    </div>
  );
};

export default VendorProfile;
