/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaLock,
  FaIdCard,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const PersonalDetailsForm = ({ register, errors }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2 border-b border-gray-200/50 pb-2 mb-6">
        <FaUser className="text-purple-600" /> Personal Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
            Full Name *
          </label>
          <div className="relative">
            <FaUser className="absolute top-3.5 left-3 text-gray-400" />
            <input
              type="text"
              {...register("name")}
              className="input-glass pl-10"
              placeholder="John Doe"
            />
          </div>
          <p className="error-text">{errors.name?.message}</p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
            Email Address *
          </label>
          <div className="relative">
            <FaEnvelope className="absolute top-3.5 left-3 text-gray-400" />
            <input
              type="email"
              {...register("email")}
              className="input-glass pl-10"
              placeholder="vendor@example.com"
            />
          </div>
          <p className="error-text">{errors.email?.message}</p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
            Phone Number *
          </label>
          <div className="relative">
            <FaPhoneAlt className="absolute top-3.5 left-3 text-gray-400" />
            <input
              type="tel"
              {...register("phone")}
              maxLength={10}
              onInput={(e) =>
                (e.target.value = e.target.value.replace(/[^0-9]/g, ""))
              }
              className="input-glass pl-10"
              placeholder="9876543210"
            />
          </div>
          <p className="error-text">{errors.phone?.message}</p>
        </div>

        {/* Aadhar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
            Aadhar Number *
          </label>
          <div className="relative">
            <FaIdCard className="absolute top-3.5 left-3 text-gray-400" />
            <input
              type="text"
              {...register("aadhar")}
              maxLength={12}
              onInput={(e) =>
                (e.target.value = e.target.value.replace(/[^0-9]/g, ""))
              }
              className="input-glass pl-10"
              placeholder="12-digit UID"
            />
          </div>
          <p className="error-text">{errors.aadhar?.message}</p>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
            Password *
          </label>
          <div className="relative">
            <FaLock className="absolute top-3.5 left-3 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className="input-glass pl-10 pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-3.5 right-3 text-gray-400 hover:text-gray-700 focus:outline-none transition-colors"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <p className="error-text">{errors.password?.message}</p>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
            Confirm Password *
          </label>
          <div className="relative">
            <FaLock className="absolute top-3.5 left-3 text-gray-400" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              className="input-glass pl-10 pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute top-3.5 right-3 text-gray-400 hover:text-gray-700 focus:outline-none transition-colors"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <p className="error-text">{errors.confirmPassword?.message}</p>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsForm;
