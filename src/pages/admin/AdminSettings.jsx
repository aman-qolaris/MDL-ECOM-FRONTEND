import { useEffect, useState } from "react";
import { FaUserShield, FaSave } from "react-icons/fa";
import { changeAdminPassword } from "../../services/authService"; // 👈 Import service

const AdminSettings = () => {
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
  });

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

    // 2. Validate Password Fields
    if (!adminData.currentPassword || !adminData.newPassword) {
      alert("Please enter both current and new passwords to change them.");
      return;
    }

    try {
      // 3. Call the API
      await changeAdminPassword(
        adminData.currentPassword,
        adminData.newPassword
      );

      alert("Password updated successfully!");

      // Clear password fields
      setAdminData({ ...adminData, currentPassword: "", newPassword: "" });
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update password");
    }
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Settings</h2>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-2xl">
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          <FaUserShield className="text-blue-600" /> Account Security
        </h3>

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
            <input
              type="password"
              value={adminData.currentPassword}
              onChange={(e) =>
                setAdminData({ ...adminData, currentPassword: e.target.value })
              }
              className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              New Password
            </label>
            <input
              type="password"
              value={adminData.newPassword}
              onChange={(e) =>
                setAdminData({ ...adminData, newPassword: e.target.value })
              }
              className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter new password"
            />
          </div>

          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition flex items-center gap-2 cursor-pointer"
          >
            <FaSave /> Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
