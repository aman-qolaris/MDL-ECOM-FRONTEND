import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { authStart, authSuccess, authFailure } from "../store/slices/authSlice";
import { registerUser } from "../services/authService";
// Added icons for modern UI
import { FaUser, FaEnvelope, FaPhoneAlt, FaLock } from "react-icons/fa";

// Updated Schema: Password min 8 chars + Complexity Format
const schema = yup
  .object({
    name: yup.string().required("Full name is required"),
    email: yup // <--- ADDED THIS AS REQUESTED
      .string()
      .email("Invalid email format")
      .required("Email is required"),
    phone: yup
      .string()
      .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
      .required("Phone is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      )
      .required("Password is required"),
  })
  .required();

const Register = () => {
  const dispatch = useDispatch();
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
      // Send data directly (name, email, phone, password)
      const result = await registerUser(data);

      dispatch(authSuccess(result));
      navigate("/");
    } catch (err) {
      dispatch(
        authFailure(err.response?.data?.message || "Registration failed")
      );
    }
  };

  return (
    // Outer Container: Centered with animation
    <div className="flex justify-center items-center min-h-[85vh] animate-fadeIn p-4">
      {/* GLASS CARD */}
      <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/50 relative overflow-hidden">
        {/* Decorative Background Blobs */}
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
              Full Name
            </label>
            <div className="relative">
              <FaUser className="absolute top-3.5 left-3 text-gray-400" />
              <input
                {...register("name")}
                type="text"
                placeholder="John Doe"
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
              Email Address
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
              Phone Number
            </label>
            <div className="relative">
              <FaPhoneAlt className="absolute top-3.5 left-3 text-gray-400" />
              <input
                {...register("phone")}
                type="tel"
                placeholder="9876543210"
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
              Password
            </label>
            <div className="relative">
              <FaLock className="absolute top-3.5 left-3 text-gray-400" />
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 shadow-inner"
              />
            </div>
            <p className="text-red-500 text-xs mt-1 pl-1">
              {errors.password?.message}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
