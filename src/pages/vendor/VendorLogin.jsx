import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// Added FaPhoneAlt and FaLock for the inputs
import { FaStore, FaPhoneAlt, FaLock } from "react-icons/fa";
import api from "../../services/api"; // Uses port 5007

const VendorLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Added loading state for better UX

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Hit the VENDOR service
    api
      .post("/vendor/login", formData)
      .then((response) => {
        // Save token specific to vendor
        localStorage.setItem("vendorToken", response.data.token);
        alert("Login Successful!");
        navigate("/vendor/dashboard");
      })
      .catch((err) => {
        console.error("Vendor Login Error:", err);
        setError(err.response?.data?.message || "Login failed");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    // Outer Container: Centered with animation
    <div className="flex justify-center items-center min-h-[80vh] animate-fadeIn p-4">
      {/* GLASS CARD */}
      <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/50 relative overflow-hidden">
        {/* Decorative Background Blobs */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>

        {/* Header Icon */}
        <div className="flex justify-center mb-4 relative z-10">
          <div className="bg-purple-100 p-3 rounded-full text-purple-600 shadow-sm">
            <FaStore size={32} />
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-2 text-center text-gray-800 relative z-10">
          Vendor Portal
        </h2>
        <p className="text-center text-gray-500 mb-6 text-sm relative z-10">
          Sign in to manage your store
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100/80 border border-red-200 text-red-700 rounded-lg text-sm backdrop-blur-sm relative z-10">
            {error}
          </div>
        )}

        <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
          {/* Phone Number Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
              Phone Number
            </label>
            <div className="relative">
              <FaPhoneAlt className="absolute top-3.5 left-3 text-gray-400" />
              <input
                name="phone"
                type="tel"
                required
                maxLength={10} // 1. Blocks input after 10 characters
                pattern="\d{10}" // 2. Ensures strictly 10 digits are required
                placeholder="Enter your 10-digit phone"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 shadow-inner"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
              Password
            </label>
            <div className="relative">
              <FaLock className="absolute top-3.5 left-3 text-gray-400" />
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 shadow-inner"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? "Signing In..." : "Access Dashboard"}
            </button>
          </div>
        </form>

        {/* Footer Links */}
        <div className="mt-8 relative z-10">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300/50" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/0 backdrop-blur-sm text-gray-500">
                New to platform?
              </span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/vendor/register"
              className="text-purple-600 hover:text-purple-800 font-bold hover:underline transition-colors"
            >
              Register as a Vendor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorLogin;
