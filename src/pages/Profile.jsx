import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { getMyOrders } from "../services/orderService";
import { updateUserProfile, changePassword } from "../services/authService";
import { logout, updateUser } from "../store/slices/authSlice";
import {
  FaUser,
  FaBoxOpen,
  FaSignOutAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCamera,
} from "react-icons/fa";
import OrderDetailModal from "../components/profile/OrderDetailModal";

const Profile = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);

  // Check if activeTab was passed from navigation (e.g., from OrderSuccess page)
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "profile"
  );

  // --- STATES ---
  const [orders, setOrders] = useState([]);
  // --- NEW STATE FOR MODAL ---
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Added profilePic to formData
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profilePic: "",
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // --- SHOW/HIDE PASSWORD STATES ---
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        profilePic: user.profilePic || "", // Load existing pic
      });
    }
  }, [user]);

  // --- FETCHING DATA BASED ON TAB ---
  useEffect(() => {
    if (activeTab === "orders") fetchOrders();
  }, [activeTab]);

  // Also fetch orders when coming from OrderSuccess page
  useEffect(() => {
    if (location.state?.activeTab === "orders") {
      fetchOrders();
    }
  }, [location.state]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getMyOrders(user?.id);
      console.log(`Fetched ${data.length} orders for user ${user?.id}`);
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      alert("Failed to load orders. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // --- IMAGE UPLOAD HANDLER (NEW) ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Update local state to show preview immediately
        setFormData({ ...formData, profilePic: reader.result });
        // Optional: Auto-save immediately or wait for "Save Changes"
        // Let's wait for "Save Changes" to be safe
        setIsEditing(true);
      };
      reader.readAsDataURL(file); // Converts image to Base64 string
    }
  };

  // --- HANDLERS ---
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const updatedData = await updateUserProfile(user.id, formData);
      dispatch(updateUser(updatedData));
      setIsEditing(false);
      alert("Profile Updated!");
    } catch (error) {
      alert("Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // --- PASSWORD HANDLER WITH VALIDATION ---
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    // 1. Check if New and Confirm match
    if (passwordData.new !== passwordData.confirm) {
      setPasswordError("New passwords do not match");
      return;
    }

    // 2. STRONG PASSWORD VALIDATION
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(passwordData.new)) {
      setPasswordError(
        "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }

    try {
      setSaving(true);
      await changePassword(user.id, passwordData.current, passwordData.new);
      setPasswordSuccess("Password updated successfully!");
      setPasswordData({ current: "", new: "", confirm: "" }); // Clear form
      // Reset visibility states
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    } catch (error) {
      const serverMessage =
        error.response?.data?.message || "Failed to update password";
      setPasswordError(serverMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Logout?")) dispatch(logout());
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">My Account</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* SIDEBAR */}
        <div className="md:w-1/4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col items-center">
              {/* === PROFILE PICTURE SECTION === */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-3 bg-blue-100 flex items-center justify-center">
                  {/* If image exists, show it. Else show initial */}
                  {formData.profilePic ? (
                    <img
                      src={formData.profilePic}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 text-3xl font-bold">
                      {user?.name?.charAt(0) || "U"}
                    </span>
                  )}
                </div>

                {/* Camera Icon Overlay (Visible on Hover) */}
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-2 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition shadow-sm"
                  title="Upload Photo"
                >
                  <FaCamera size={14} />
                </button>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>

              <h2 className="font-bold text-gray-800">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.phone}</p>
              {user?.email && (
                <p className="text-sm text-gray-500">{user?.email}</p>
              )}
            </div>

            <nav className="flex flex-col p-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                  activeTab === "profile"
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaUser /> Profile Details
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                  activeTab === "orders"
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaBoxOpen /> Order History
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                  activeTab === "security"
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaLock /> Security
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-500 hover:bg-red-50 transition mt-2"
              >
                <FaSignOutAlt /> Logout
              </button>
            </nav>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="md:w-3/4">
          {/* === TAB 1: PROFILE DETAILS === */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Personal Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition font-semibold"
                  >
                    <FaEdit /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full border p-2 rounded-lg"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">
                      {user?.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Phone
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        disabled={true} // <--- ✅ 1. DISABLES EDITING
                        className="w-full border p-2 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed" // <--- ✅ 2. VISUAL CUE (Gray background)
                        title="Phone number cannot be changed"
                      />
                      {/* Optional: Lock Icon to show it's read-only */}
                      <FaLock
                        className="absolute right-3 top-3 text-gray-400"
                        size={12}
                      />
                    </div>
                  ) : (
                    <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">
                      {user?.phone}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border p-2 rounded-lg"
                      placeholder="Enter your email"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">
                      {user?.email || formData.email || "No email added"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* === TAB 2: ORDER HISTORY === */}
          {activeTab === "orders" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fadeIn">
              <h2 className="text-xl font-bold mb-6 text-gray-800">
                Order History
              </h2>
              {loading ? (
                <p>Loading orders...</p>
              ) : orders.length === 0 ? (
                <p>No orders found.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-100 rounded-lg p-4"
                    >
                      <div className="flex justify-between mb-2">
                        <span className="font-mono text-gray-800 font-bold">
                          {order.id}
                        </span>
                        <span className="font-bold text-blue-600">
                          ₹{order.totalAmount}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status || "Processing"}{" "}
                      </span>

                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="absolute px-2 py-1 text-blue-600 font-semibold cursor-pointer text-sm hover:underline hover:text-blue-800 transition"
                      >
                        View Details &rarr;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* === TAB 4: SECURITY (CHANGE PASSWORD) === */}
          {activeTab === "security" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fadeIn">
              <h2 className="text-xl font-bold mb-6 text-gray-800">
                Change Password
              </h2>

              {passwordSuccess && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
                  {passwordSuccess}
                </div>
              )}
              {passwordError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {passwordError}
                </div>
              )}

              <form
                onSubmit={handlePasswordChange}
                className="max-w-md space-y-4"
              >
                {/* 1. CURRENT PASSWORD */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                      value={passwordData.current}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          current: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-3 text-gray-500 hover:text-blue-600 focus:outline-none"
                    >
                      {showCurrent ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* 2. NEW PASSWORD */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      required
                      minLength={8}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                      value={passwordData.new}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          new: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-3 text-gray-500 hover:text-blue-600 focus:outline-none"
                    >
                      {showNew ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* 3. CONFIRM PASSWORD */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      minLength={8}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                      value={passwordData.confirm}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirm: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-3 text-gray-500 hover:text-blue-600 focus:outline-none"
                    >
                      {showConfirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 mt-2"
                >
                  {saving ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      {/* 4. RENDER MODAL OUTSIDE THE TABS (BUT INSIDE RETURN) */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default Profile;
