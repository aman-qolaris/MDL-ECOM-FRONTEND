import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { FaEdit, FaUniversity, FaSave, FaTimes } from "react-icons/fa";
import { updateUserProfile } from "../../services/authService";
import { updateUser } from "../../store/slices/authSlice";

const BankDetailsTab = ({ user }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    ifscCode: "",
  });

  // Sync with user data from Redux
  useEffect(() => {
    if (user) {
      setFormData({
        bankName: user.bankName || "",
        accountNumber: user.accountNumber || "",
        ifscCode: user.ifscCode || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = new FormData();
      // Append existing profile data to avoid overwriting with nulls if backend requires it
      data.append("name", user.name);

      // Append Bank Details
      data.append("bankName", formData.bankName);
      data.append("accountNumber", formData.accountNumber);
      data.append("ifscCode", formData.ifscCode);

      const updatedData = await updateUserProfile(user.id, data);

      // Update Redux
      dispatch(updateUser(updatedData));

      setIsEditing(false);
      alert("Bank Details Updated Successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update bank details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FaUniversity className="text-blue-600" /> Bank Account Details
        </h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-semibold transition"
          >
            <FaEdit /> Edit Details
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                // Reset form
                setFormData({
                  bankName: user.bankName || "",
                  accountNumber: user.accountNumber || "",
                  ifscCode: user.ifscCode || "",
                });
              }}
              className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition font-medium"
            >
              <FaTimes /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-bold shadow-sm disabled:opacity-50"
            >
              <FaSave /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bank Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Bank Name
          </label>
          {isEditing ? (
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="e.g. HDFC Bank"
              className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          ) : (
            <p className="text-gray-900 font-medium text-lg border-b border-gray-100 pb-2">
              {user.bankName || "Not provided"}
            </p>
          )}
        </div>

        {/* IFSC Code */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            IFSC Code
          </label>
          {isEditing ? (
            <input
              type="text"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
              placeholder="e.g. HDFC0001234"
              className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
            />
          ) : (
            <p className="text-gray-900 font-medium text-lg border-b border-gray-100 pb-2 uppercase">
              {user.ifscCode || "Not provided"}
            </p>
          )}
        </div>

        {/* Account Number */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Account Number
          </label>
          {isEditing ? (
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="Enter Account Number"
              className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          ) : (
            <p className="text-gray-900 font-medium text-lg border-b border-gray-100 pb-2 tracking-wider">
              {user.accountNumber
                ? `XXXX-XXXX-${user.accountNumber.slice(-4)}`
                : "Not provided"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankDetailsTab;
