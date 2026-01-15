import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { authStart, authSuccess, authFailure } from "../store/slices/authSlice";
import { registerUser } from "../services/authService";
import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaLock,
  FaUniversity,
  FaMoneyCheckAlt,
  FaCode,
} from "react-icons/fa";

// 🔴 UPDATED SCHEMA: Strict Limits
const schema = yup
  .object({
    name: yup
      .string()
      .required("Full name is required")
      .min(4, "Name must be at least 4 characters") // ✅ Min 4
      .max(20, "Name cannot exceed 20 characters"), // ✅ Max 20

    email: yup.string().email("Invalid email format").notRequired(), // (Kept Optional as per previous request)

    phone: yup
      .string()
      .required("Phone is required")
      .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"), // ✅ Strict 10 digits

    password: yup
      .string()
      .required("Password is required")
      .min(8, "Password must be 8-16 characters") // ✅ Min 8
      .max(16, "Password must be 8-16 characters") // ✅ Max 16
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),

    // Bank Details
    bankAccountHolderName: yup
      .string()
      .required("Account Holder Name is required"), // <--- ADD THIS

    bankName: yup.string().required("Bank Name is required"),

    accountNumber: yup
      .string()
      .required("Account Number is required")
      .matches(/^\d{9,18}$/, "Account Number must be 9-18 digits"), // ✅ Range 9-18

    ifscCode: yup
      .string()
      .required("IFSC Code is required")
      .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC Code (11 chars)"), // ✅ Strict Format
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
                maxLength={20} // 🔴 Stop typing after 20 chars
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 shadow-inner"
              />
            </div>
            <p className="text-red-500 text-xs mt-1 pl-1">
              {errors.name?.message}
            </p>
          </div>

          {/* Email Field (Optional) */}
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
                maxLength={10} // 🔴 Stop typing after 10 digits
                onInput={(e) =>
                  (e.target.value = e.target.value.replace(/[^0-9]/g, ""))
                } // Only allow numbers
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
                type="password"
                placeholder="••••••••"
                maxLength={16} // 🔴 Stop typing after 16 chars
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 shadow-inner"
              />
            </div>
            <p className="text-red-500 text-xs mt-1 pl-1">
              {errors.password?.message}
            </p>
          </div>

          {/* Bank Details Section */}
          <div className="border-t border-gray-200 pt-4 mt-2">
            <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wide">
              Bank Details
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {/* --- ADD THIS BLOCK FOR ACCOUNT HOLDER NAME --- */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 pl-1">
                  Account Holder Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute top-3.5 left-3 text-gray-400" />
                  <input
                    {...register("bankAccountHolderName")}
                    type="text"
                    placeholder="Name as per Bank Records"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-inner"
                  />
                </div>
                <p className="text-red-500 text-xs mt-1 pl-1">
                  {errors.bankAccountHolderName?.message}
                </p>
              </div>
              {/* ---------------------------------------------- */}
              {/* Bank Name */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 pl-1">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUniversity className="absolute top-3.5 left-3 text-gray-400" />
                  <input
                    {...register("bankName")}
                    type="text"
                    placeholder="e.g. HDFC Bank"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-inner"
                  />
                </div>
                <p className="text-red-500 text-xs mt-1 pl-1">
                  {errors.bankName?.message}
                </p>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 pl-1">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaMoneyCheckAlt className="absolute top-3.5 left-3 text-gray-400" />
                  <input
                    {...register("accountNumber")}
                    type="text"
                    placeholder="Account Number"
                    maxLength={18} // 🔴 Stop typing after 18 digits
                    onInput={(e) =>
                      (e.target.value = e.target.value.replace(/[^0-9]/g, ""))
                    } // Only numbers
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-inner"
                  />
                </div>
                <p className="text-red-500 text-xs mt-1 pl-1">
                  {errors.accountNumber?.message}
                </p>
              </div>

              {/* IFSC Code */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 pl-1">
                  IFSC Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaCode className="absolute top-3.5 left-3 text-gray-400" />
                  <input
                    {...register("ifscCode")}
                    type="text"
                    placeholder="e.g. HDFC0001234"
                    maxLength={11} // 🔴 Stop typing after 11 chars
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-inner uppercase"
                  />
                </div>
                <p className="text-red-500 text-xs mt-1 pl-1">
                  {errors.ifscCode?.message}
                </p>
              </div>
            </div>
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
