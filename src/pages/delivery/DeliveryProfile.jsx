import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaMapMarkerAlt,
  FaLock,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaTruck,
  FaArrowLeft,
} from "react-icons/fa";
import {
  getDeliveryProfile,
  changeDeliveryPassword,
} from "../../services/deliveryService";
import { validatePassword } from "../../utils/passwordValidator";

const DeliveryProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Profile State (Read-Only Data from DB)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    state: "",
    city: "",
    assignedAreas: [],
    maxOrders: 0,
    active: false,
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Visibility Toggles
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getDeliveryProfile();
        if (data && data.profile) {
          setProfile(data.profile);
        }
      } catch (error) {
        console.error("Error fetching delivery profile:", error);
        alert("Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
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
      await changeDeliveryPassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      alert("Password updated successfully!");

      // Clear form & resets toggles
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowOld(false);
      setShowNew(false);
      setShowConfirm(false);
    } catch (error) {
      console.error("Error updating password:", error);
      alert(
        error.response?.data?.message ||
          "Failed to update password. Check your old password.",
      );
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading Profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <button
        onClick={() => navigate("/delivery/dashboard")}
        className="text-sm font-bold text-gray-500 hover:text-blue-600 flex items-center gap-2 transition-colors mb-2"
      >
        <FaArrowLeft /> Back to Dashboard
      </button>

      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaTruck className="text-blue-600" /> My Profile
      </h2>

      {/* --- Card 1: Personal Information (Read-Only) --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          <FaUser className="text-blue-500" /> Personal Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Full Name
            </label>
            <input
              type="text"
              value={profile.name}
              disabled
              className="w-full border p-2 rounded mt-1 bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Email Address
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full border p-2 rounded mt-1 bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Phone Number
            </label>
            <input
              type="text"
              value={profile.phone}
              disabled
              className="w-full border p-2 rounded mt-1 bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Account Status
            </label>
            <div className="mt-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${profile.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {profile.active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Card 2: Service Area & Capacity (Read-Only) --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          <FaMapMarkerAlt className="text-blue-500" /> Assignment Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              State
            </label>
            <input
              type="text"
              value={profile.state}
              disabled
              className="w-full border p-2 rounded mt-1 bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              City
            </label>
            <input
              type="text"
              value={profile.city}
              disabled
              className="w-full border p-2 rounded mt-1 bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Daily Order Limit
            </label>
            <input
              type="text"
              value={profile.maxOrders}
              disabled
              className="w-full border p-2 rounded mt-1 bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Assigned Areas
            </label>
            <div className="flex flex-wrap gap-2">
              {profile.assignedAreas && profile.assignedAreas.length > 0 ? (
                profile.assignedAreas.map((area, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded text-sm"
                  >
                    {area}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm italic">
                  No specific areas assigned yet.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <hr className="border-gray-300 my-8" />

      {/* --- Card 3: Security & Password Form --- */}
      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <FaLock className="text-red-500" /> Security
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Update your account password to keep it secure.
          </p>

          <div className="grid grid-cols-1 gap-6 max-w-lg">
            {/* Old Password */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Current Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showOld ? "text" : "password"}
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full border p-2 pr-10 rounded"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 focus:outline-none"
                >
                  {showOld ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 focus:outline-none"
                >
                  {showNew ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 focus:outline-none"
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

export default DeliveryProfile;
