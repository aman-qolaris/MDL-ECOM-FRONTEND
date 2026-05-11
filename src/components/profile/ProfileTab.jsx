import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { FaEdit, FaCamera, FaLock } from "react-icons/fa";
import { updateUserProfile } from "../../services/authService";
import { updateUser } from "../../store/slices/authSlice";

const ProfileTab = ({ user }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profilePic: "",
  });

  // Sync user data when component loads or user changes
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

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageUpload = (e) => {
    const file = e.target.files;
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePic: reader.result });
        setIsEditing(true); // Auto-enable edit mode on image change
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      if (selectedFile) {
        data.append("profilePic", selectedFile);
      }

      const updatedData = await updateUserProfile(user.id, data);

      // Update Redux Store
      dispatch(updateUser(updatedData));

      setIsEditing(false);
      setSelectedFile(null);
      globalThis.alert("Profile Updated Successfully!");
    } catch (error) {
      console.error(error);
      if (error.validationErrors) {
        const formattedErrors = error.validationErrors
          .map((zError) => zError.message)
          .join("\n");
        globalThis.alert("Validation Failed:\n" + formattedErrors);
      } else {
        globalThis.alert(
          error.response?.data?.message || "Failed to update profile.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fadeIn">
      {/* HEADER & EDIT BUTTON */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Personal Information
        </h2>
        {isEditing ? (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                // Reset form to original user data on cancel
                setFormData({
                  name: user.name || "",
                  email: user.email || "",
                  phone: user.phone || "",
                  profilePic: user.profilePic || "",
                });
                setSelectedFile(null);
              }}
              className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition font-medium focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-bold shadow-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <FaEdit /> Edit Profile
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* LEFT: PROFILE PICTURE */}
        <div className="flex flex-col items-center md:w-1/3">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-blue-50 flex items-center justify-center">
              {formData.profilePic ? (
                <img
                  src={formData.profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-blue-500 text-4xl font-bold">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </div>

            {/* Camera Icon (Only visible in Edit Mode) */}
            {isEditing && (
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-1 right-1 bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 transition shadow-md border-2 border-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                title="Change Photo"
              >
                <FaCamera size={14} />
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
          <p className="mt-4 text-sm text-gray-500 text-center">
            {isEditing ? "Click camera icon to change" : "Profile Picture"}
          </p>
        </div>

        {/* RIGHT: FORM FIELDS */}
        <div className="md:w-2/3 grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Full Name
            </label>
            {isEditing ? (
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  disabled
                  className="w-full border border-gray-200 bg-gray-50 px-4 py-2.5 rounded-lg text-gray-500 cursor-not-allowed"
                />
                <FaLock
                  className="absolute right-4 top-3.5 text-gray-400"
                  size={14}
                />
              </div>
            ) : (
              <p className="text-gray-900 font-medium text-lg border-b border-gray-100 pb-2">
                {user?.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            ) : (
              <p className="text-gray-900 font-medium text-lg border-b border-gray-100 pb-2">
                {user?.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.phone}
                disabled
                className="w-full border border-gray-200 bg-gray-50 px-4 py-2.5 rounded-lg text-gray-500 cursor-not-allowed"
              />
              <FaLock
                className="absolute right-4 top-3.5 text-gray-400"
                size={14}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Phone number cannot be changed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

ProfileTab.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    profilePic: PropTypes.string,
  }).isRequired,
};

export default ProfileTab;
