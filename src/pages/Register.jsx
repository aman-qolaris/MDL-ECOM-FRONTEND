import { useEffect, useState } from "react";
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
import { registerUser } from "../services/authService";
import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa"; // Removed Bank Icons

// 🔴 UPDATED SCHEMA: Removed Bank Details
const schema = yup
  .object({
    name: yup
      .string()
      .required("Full name is required")
      .min(4, "Name must be at least 4 characters")
      .max(20, "Name cannot exceed 20 characters"),

    email: yup
      .string()
      .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message: "Please enter a valid email address (e.g., name@example.com)",
        excludeEmptyString: true,
      })
      .notRequired(),

    phone: yup
      .string()
      .required("Phone is required")
      .matches(
        /^[6-9]\d{9}$/,
        "Please enter a valid Indian phone number (10 digits starting with 6-9)",
      ),

    password: yup
      .string()
      .required("Password is required")
      .min(8, "Password must be 8-16 characters")
      .max(16, "Password must be 8-16 characters")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character",
      ),

    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords must match")
      .required("Please confirm your password"),
  })
  .required();

const Register = () => {
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    dispatch(authStart());
    try {
      const { confirmPassword, ...payload } = data;

      const result = await registerUser(payload);
      dispatch(authSuccess(result));
      navigate("/");
    } catch (err) {
      if (err.validationErrors) {
        err.validationErrors.forEach((zodError) => {
          if (zodError.path && zodError.path.length > 0) {
            setError(zodError.path, {
              type: "server",
              message: zodError.message,
            });
          }
        });
        dispatch(authFailure("Please check the highlighted fields below."));
      } else {
        const errorMessage =
          err.response?.data?.message || err.message || "Registration failed";
        dispatch(authFailure(errorMessage));
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[85vh] animate-fadeIn p-4">
      <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-white/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>

        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 mt-2 relative z-10">
          Create Account
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100/80 border border-red-200 text-red-700 rounded-lg text-sm backdrop-blur-sm relative z-10">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 relative z-10"
        >
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaUser className="absolute top-3.5 left-3 text-gray-400" />
              <input
                {...register("name")}
                type="text"
                placeholder="John Doe"
                maxLength={20}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 shadow-inner"
              />
            </div>
            <p className="text-red-500 text-xs mt-1 pl-1">
              {errors.name?.message}
            </p>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
              Email Address{" "}
              <span className="text-xs text-gray-400 font-normal">
                (Optional)
              </span>
            </label>
            <div className="relative">
              <FaEnvelope className="absolute top-3.5 left-3 text-gray-400" />
              <input
                {...register("email")}
                type="email"
                placeholder="john@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 shadow-inner"
              />
            </div>
            <p className="text-red-500 text-xs mt-1 pl-1">
              {errors.email?.message}
            </p>
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaPhoneAlt className="absolute top-3.5 left-3 text-gray-400" />
              <input
                {...register("phone")}
                type="tel"
                placeholder="9876543210"
                maxLength={10}
                onInput={(e) =>
                  (e.target.value = e.target.value.replace(/[^0-9]/g, ""))
                }
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 shadow-inner"
              />
            </div>
            <p className="text-red-500 text-xs mt-1 pl-1">
              {errors.phone?.message}
            </p>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaLock className="absolute top-3.5 left-3 text-gray-400" />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"} // 🔴 Dynamic Type
                placeholder="••••••••"
                maxLength={16}
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 shadow-inner" // 🔴 Changed pr-4 to pr-12
              />
              {/* 🔴 EYE BUTTON */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-3.5 right-4 text-gray-400 hover:text-purple-600 focus:outline-none transition-colors"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            <p className="text-red-500 text-xs mt-1 pl-1">
              {errors.password?.message}
            </p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaLock className="absolute top-3.5 left-3 text-gray-400" />
              <input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"} // 🔴 Dynamic Type
                placeholder="••••••••"
                maxLength={16}
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 shadow-inner" // 🔴 Changed pr-4 to pr-12
              />
              {/* 🔴 EYE BUTTON */}
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-3.5 right-4 text-gray-400 hover:text-purple-600 focus:outline-none transition-colors"
              >
                {showConfirmPassword ? (
                  <FaEyeSlash size={18} />
                ) : (
                  <FaEye size={18} />
                )}
              </button>
            </div>
            <p className="text-red-500 text-xs mt-1 pl-1">
              {errors.confirmPassword?.message}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 relative z-10">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-purple-600 hover:text-purple-800 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
