import { useState, useEffect } from "react";
import {
  FaStore,
  FaUniversity,
  FaSave,
  FaUser,
  FaLock,
  FaKey,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import api from "../../services/api";
import { changeVendorPassword } from "../../services/vendorService"; // Import the new service
import { validatePassword } from "../../utils/passwordValidator";

const VendorProfile = () => {
  const [loading, setLoading] = useState(true);

  // Initial State for Profile
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

  // State for Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch Vendor Data on Page Load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("vendorToken");

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await api.get("/vendor/me");
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
        if (error.response && error.response.status === 403) {
          alert("Session expired or unauthorized. Please login again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    alert("Profile Update feature coming soon!");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const validationError = validatePassword(passwordData.newPassword);
    if (validationError) {
      alert(validationError);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    try {
      await changeVendorPassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      alert("Password updated successfully!");

      // Clear the form fields after successful update
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      alert(
        error.response?.data?.error ||
          "Failed to update password. Please check your current password.",
      );
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading Profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop Settings</h2>

      {/* --- FORM 1: PROFILE & BANKING --- */}
      <form onSubmit={handleProfileSubmit} className="space-y-6">
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
                onChange={handleProfileChange}
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
                onChange={handleProfileChange}
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
                onChange={handleProfileChange}
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
                onChange={handleProfileChange}
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
                onChange={handleProfileChange}
                className="w-full border p-2 rounded mt-1"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
        >
          <FaSave /> Save Profile Changes
        </button>
      </form>

      <hr className="border-gray-300 my-8" />

      {/* --- FORM 2: SECURITY & PASSWORD --- */}
      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <FaLock className="text-red-500" /> Security
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Update your account password. Ensure it is at least 6 characters
            long.
          </p>

          <div className="grid grid-cols-1 gap-6 max-w-lg">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600">
                Current Password
              </label>
              <div className="relative mt-1 w-full md:w-1/2">
                <input
                  type={showCurrent ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full border p-2 pr-10 rounded"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600 focus:outline-none"
                >
                  {showCurrent ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                New Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                  className="w-full border p-2 pr-10 rounded"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600 focus:outline-none"
                >
                  {showNew ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Confirm New Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                  className="w-full border p-2 pr-10 rounded"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600 focus:outline-none"
                >
                  {showConfirm ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition flex items-center gap-2"
        >
          <FaKey /> Update Password
        </button>
      </form>
    </div>
  );
};

export default VendorProfile;
