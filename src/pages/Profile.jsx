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

  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "profile"
  );

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ New State for Raw File
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profilePic: "",
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        profilePic: user.profilePic || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "orders") fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getMyOrders(user?.id);
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // ✅ 1. Store raw file
      setSelectedFile(file);

      // 2. Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePic: reader.result });
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      // ✅ 3. Create FormData
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);

      if (selectedFile) {
        data.append("profilePic", selectedFile);
      }

      const updatedData = await updateUserProfile(user.id, data);
      dispatch(updateUser(updatedData));

      setIsEditing(false);
      setSelectedFile(null); // Reset file
      alert("Profile Updated!");
    } catch (error) {
      alert("Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordData.new !== passwordData.confirm) {
      setPasswordError("New passwords do not match");
      return;
    }

    // Simple length check for brevity, keep regex if preferred
    if (passwordData.new.length < 8) {
      setPasswordError("Password must be at least 8 chars");
      return;
    }

    try {
      setSaving(true);
      await changePassword(user.id, passwordData.current, passwordData.new);
      setPasswordSuccess("Password updated successfully!");
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (error) {
      setPasswordError(
        error.response?.data?.message || "Failed to update password"
      );
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
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-3 bg-blue-100 flex items-center justify-center">
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
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-2 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition shadow-sm"
                >
                  <FaCamera size={14} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
              <h2 className="font-bold text-gray-800">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
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

        {/* CONTENT */}
        <div className="md:w-3/4">
          {activeTab === "profile" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Personal Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg font-semibold"
                  >
                    <FaEdit /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
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
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.phone}
                      disabled
                      className="w-full border p-2 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                    <FaLock
                      className="absolute right-3 top-3 text-gray-400"
                      size={12}
                    />
                  </div>
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
                    />
                  ) : (
                    <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">
                      {user?.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800">
                Order History
              </h2>
              {loading ? (
                <p>Loading...</p>
              ) : orders.length === 0 ? (
                <p>No orders.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-100 rounded-lg p-4 flex justify-between"
                    >
                      <div>
                        <span className="font-bold">#{order.id}</span>
                      </div>
                      <div>
                        <span className="font-bold text-blue-600">
                          ₹{order.amount}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-500 hover:underline"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "security" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800">
                Change Password
              </h2>
              {passwordSuccess && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                  {passwordSuccess}
                </div>
              )}
              {passwordError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {passwordError}
                </div>
              )}
              <form
                onSubmit={handlePasswordChange}
                className="max-w-md space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full border rounded-lg px-4 py-2"
                    value={passwordData.current}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        current: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full border rounded-lg px-4 py-2"
                    value={passwordData.new}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, new: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full border rounded-lg px-4 py-2"
                    value={passwordData.confirm}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirm: e.target.value,
                      })
                    }
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
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
