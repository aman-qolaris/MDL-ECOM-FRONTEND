import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  authStart,
  authSuccess,
  authFailure,
  clearError,
} from "../store/slices/authSlice";
import { loginUser } from "../services/authService";
// Added icons for the modern UI
import { FaPhoneAlt, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useEffect, useState } from "react";

// Schema: Validate Phone & Password
const schema = yup
  .object({
    phone: yup
      .string()
      .matches(
        /^[6-9]\d{9}$/,
        "Please enter a valid Indian phone number (10 digits starting with 6-9)",
      )
      .required("Phone number is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(16, "Password cannot exceed 16 characters")
      .required("Password is required"),
  })
  .required();

const Login = () => {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  // 🟢 ADD THIS BLOCK
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    dispatch(authStart());
    try {
      // 1. Authenticate User
      const result = await loginUser(data);
      dispatch(authSuccess(result));

      // 2. CHECK ROLE & REDIRECT
      const role = result.role || result.user?.role;

      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "vendor") {
        navigate("/vendor/dashboard");
      } else {
        navigate("/"); // Customers go to Home/Shop
      }
    } catch (err) {
      dispatch(
        authFailure(
          err.response?.data?.message || "Invalid phone number or password",
        ),
      );
    }
  };

  return (
    // Outer Container: Centered with animation
    <div className="flex justify-center items-center min-h-[80vh] animate-fadeIn p-4">
      {/* GLASS CARD */}
      <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/50 relative overflow-hidden">
        {/* Decorative Background Blobs */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>

        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 relative z-10">
          Welcome Back
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100/80 border border-red-200 text-red-700 rounded-lg text-sm backdrop-blur-sm relative z-10">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 relative z-10"
        >
          {/* Phone Number Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
              Phone Number
            </label>
            <div className="relative">
              <FaPhoneAlt className="absolute top-3.5 left-3 text-gray-400" />
              <input
                {...register("phone")}
                type="tel"
                maxLength={10}
                placeholder="Enter your 10-digit number"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 shadow-inner"
              />
            </div>
            <p className="text-red-500 text-xs mt-1 pl-1">
              {errors.phone?.message}
            </p>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
              Password
            </label>
            <div className="relative">
              <FaLock className="absolute top-3.5 left-3 text-gray-400" />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-3.5 right-4 text-gray-400 hover:text-blue-600 focus:outline-none transition-colors"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            <p className="text-red-500 text-xs mt-1 pl-1">
              {errors.password?.message}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* FOOTER LINKS */}
        <div className="mt-6 text-center text-sm relative z-10 space-y-3">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
            >
              Sign up (Customer)
            </Link>
          </p>

          <div className="pt-3 border-t border-gray-200/50">
            <p className="text-gray-500">
              Want to sell products?{" "}
              <Link
                to="/vendor/register"
                className="text-purple-600 hover:text-purple-800 font-bold hover:underline"
              >
                Register as Vendor
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
