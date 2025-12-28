import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaStore } from "react-icons/fa";
import api from "../../services/api"; // Uses port 5007

const VendorLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // Hit the VENDOR service, not the User service
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
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-purple-700">
          <FaStore size={50} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Vendor Portal Login
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            {/* Phone Number Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="Enter your 10-digit phone"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Sign in to Dashboard
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  New to platform?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/vendor/register"
                className="text-purple-600 hover:text-purple-500 font-medium"
              >
                Register as a Vendor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorLogin;
