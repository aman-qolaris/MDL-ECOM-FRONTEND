import { useEffect, useState } from "react";
import {
  FaUserShield,
  FaSave,
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { changeAdminPassword } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { validatePassword } from "../../utils/passwordValidator";

const AdminSettings = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("adminUser");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setAdminData((prev) => ({
        ...prev,
        name: parsed.name || "Admin",
        email: parsed.email || "admin@example.com",
      }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    // 2. Validate Password Fields
    if (
      !adminData.currentPassword ||
      !adminData.newPassword ||
      !adminData.confirmPassword
    ) {
      setErrorMessage("Please fill in all password fields.");
      return;
    }

    const validationError = validatePassword(adminData.newPassword);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (adminData.newPassword !== adminData.confirmPassword) {
      setErrorMessage("New password and confirm password do not match.");
      return;
    }

    try {
      // 3. Call the API
      await changeAdminPassword(
        adminData.currentPassword,
        adminData.newPassword,
      );

      setSuccessMessage("Password updated successfully!");

      // Clear password fields
      setAdminData({
        ...adminData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error.response?.data?.message || "Failed to update password",
      );
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 text-gray-600 transition shadow-sm"
        >
          <FaArrowLeft size={16} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Admin Settings</h2>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-2xl">
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          <FaUserShield className="text-blue-600" /> Account Security
        </h3>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded border border-red-200">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 text-sm rounded border border-green-200">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Read-Only Fields (Backend doesn't support update yet) */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Display Name{" "}
              <span className="text-xs text-gray-400">(Read Only)</span>
            </label>
            <input
              type="text"
              value={adminData.name}
              disabled
              className="w-full border p-2 rounded mt-1 bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Email <span className="text-xs text-gray-400">(Read Only)</span>
            </label>
            <input
              type="email"
              value={adminData.email}
              disabled
              className="w-full border p-2 rounded mt-1 bg-gray-100 cursor-not-allowed"
            />
          </div>

          <hr className="my-4" />

          {/* Password Fields - Now Connected */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Current Password
            </label>
            <div className="relative mt-1">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={adminData.currentPassword}
                onChange={(e) =>
                  setAdminData({
                    ...adminData,
                    currentPassword: e.target.value,
                  })
                }
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              New Password
            </label>
            <div className="relative mt-1">
              <input
                type={showNewPassword ? "text" : "password"}
                value={adminData.newPassword}
                onChange={(e) =>
                  setAdminData({ ...adminData, newPassword: e.target.value })
                }
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Confirm New Password
            </label>
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={adminData.confirmPassword}
                onChange={(e) =>
                  setAdminData({
                    ...adminData,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition flex items-center gap-2 cursor-pointer"
          >
            <FaSave /> Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
