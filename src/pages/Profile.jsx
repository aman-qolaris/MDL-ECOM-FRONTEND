import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
// 🟢 1. Import Icon
import {
  FaUser,
  FaBoxOpen,
  FaSignOutAlt,
  FaLock,
  FaUniversity,
} from "react-icons/fa";

import ProfileTab from "../components/profile/ProfileTab";
import OrdersTab from "../components/profile/OrdersTab";
import SecurityTab from "../components/profile/SecurityTab";
// 🟢 2. Import New Component
import BankDetailsTab from "../components/profile/BankDetailsTab";

const Profile = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "profile"
  );

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      dispatch(logout());
      navigate("/login");
    }
  };

  if (!user) {
    return <div className="p-8 text-center">Loading Profile...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">My Account</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* === SIDEBAR NAVIGATION === */}
        <div className="md:w-1/4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden md:sticky md:top-24">
            {/* User Mini Profile */}
            <div className="p-6 border-b border-gray-100 flex flex-col items-center bg-gray-50/50">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md mb-3 bg-blue-100 flex items-center justify-center">
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-blue-600 text-2xl font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <h2 className="font-bold text-gray-800 text-center line-clamp-1">
                {user.name}
              </h2>
              <p className="text-xs text-gray-500 text-center truncate w-full px-2">
                {user.email}
              </p>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col p-2 space-y-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition text-sm font-medium cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <FaUser
                  className={
                    activeTab === "profile" ? "text-blue-500" : "text-gray-400"
                  }
                />
                Profile Details
              </button>

              {/* 🟢 3. NEW: Bank Details Button */}
              <button
                onClick={() => setActiveTab("bank")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition text-sm font-medium cursor-pointer ${
                  activeTab === "bank"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <FaUniversity
                  className={
                    activeTab === "bank" ? "text-blue-500" : "text-gray-400"
                  }
                />
                Bank Details
              </button>

              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition text-sm font-medium cursor-pointer ${
                  activeTab === "orders"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <FaBoxOpen
                  className={
                    activeTab === "orders" ? "text-blue-500" : "text-gray-400"
                  }
                />
                Order History
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition text-sm font-medium cursor-pointer ${
                  activeTab === "security"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <FaLock
                  className={
                    activeTab === "security" ? "text-blue-500" : "text-gray-400"
                  }
                />
                Security
              </button>

              <div className="pt-2 mt-2 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition text-sm font-medium cursor-pointer"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* === MAIN CONTENT AREA === */}
        <div className="md:w-3/4">
          {activeTab === "profile" && <ProfileTab user={user} />}
          {/* 🟢 4. Render Bank Tab */}
          {activeTab === "bank" && <BankDetailsTab user={user} />}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "security" && <SecurityTab userId={user.id} />}
        </div>
      </div>
    </div>
  );
};

export default Profile;
