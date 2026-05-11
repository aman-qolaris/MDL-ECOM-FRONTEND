import { useState } from "react";
import PropTypes from "prop-types";
import { changePassword } from "../../services/authService";
import { FaInfoCircle } from "react-icons/fa";
import { validatePassword } from "../../utils/passwordValidator";

const SecurityTab = ({ userId }) => {
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    // 1. Check Matching
    if (passwordData.new !== passwordData.confirm) {
      setPasswordError("New passwords do not match.");
      return;
    }

    // 2. Check Format & Length
    const validationError = validatePassword(passwordData.new);
    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    try {
      setSaving(true);
      await changePassword(userId, passwordData.current, passwordData.new);
      setPasswordSuccess("Password updated successfully!");
      // Clear form
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (error) {
      if (error.validationErrors) {
        const formattedErrors = error.validationErrors
          .map((zError) => zError.message)
          .join(" | ");
        setPasswordError(formattedErrors);
      } else {
        setPasswordError(
          error.response?.data?.message ||
            "Failed to update password. Please check your current password.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fadeIn">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-gray-800">Security Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account password and security.
        </p>
      </div>

      {passwordSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
          ✅ {passwordSuccess}
        </div>
      )}

      {passwordError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm font-medium">
          ⚠️ {passwordError}
        </div>
      )}

      {/* Helper Text for User */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-100 text-blue-800 rounded-lg text-xs flex gap-3">
        <FaInfoCircle size={20} className="shrink-0 mt-0.5" />
        <ul className="list-disc list-inside space-y-1">
          <li>Length: 8–16 characters</li>
          <li>Must include: Uppercase, Lowercase, Number, Special Char</li>
        </ul>
      </div>

      <form onSubmit={handlePasswordChange} className="max-w-lg">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Enter current password"
              value={passwordData.current}
              onChange={(e) =>
                setPasswordData({ ...passwordData, current: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="8-16 chars, e.g. Pass@123"
              value={passwordData.new}
              onChange={(e) =>
                setPasswordData({ ...passwordData, new: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Re-enter new password"
              value={passwordData.confirm}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirm: e.target.value })
              }
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-gray-900 text-white font-bold py-3 px-8 rounded-lg hover:bg-black transition shadow-md disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              {saving ? "Updating Password..." : "Update Password"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

SecurityTab.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default SecurityTab;
