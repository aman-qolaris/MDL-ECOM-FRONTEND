import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { FaUserShield, FaPhoneAlt, FaLock } from "react-icons/fa";
import { loginAdmin } from "../../services/authService";

// ✅ Schema: Phone Validation
const schema = yup
  .object({
    phone: yup
      .string()
      .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
      .required("Phone number is required"),
    password: yup.string().required("Password is required"),
  })
  .required();

const AdminLogin = () => {
  const navigate = useNavigate();

  // ✅ Local state handles UI updates now (No Redux)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    // 1. Start Loading & Clear Errors
    setLoading(true);
    setError(null);

    try {
      const result = await loginAdmin(data);

      // 2. Save Admin Credentials Separately
      localStorage.setItem("adminToken", result.token);
      localStorage.setItem("adminUser", JSON.stringify(result.user));

      // 3. Redirect
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Admin Login Error:", err);
      // 4. Handle Error Locally
      setError(err.response?.data?.message || "Invalid phone or password");
    } finally {
      // 5. Stop Loading (Always runs)
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] animate-fadeIn p-4">
      <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/50 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gray-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-slate-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="flex justify-center mb-4 relative z-10">
          <div className="bg-slate-100 p-3 rounded-full text-slate-800 shadow-sm">
            <FaUserShield size={32} />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2 text-center text-gray-800 relative z-10">
          Admin Portal
        </h1>
        <p className="text-center text-gray-500 mb-6 text-sm relative z-10">
          Sign in to manage your store
        </p>

        {/* ✅ Display Local Error State */}
        {error && (
          <div className="mb-4 p-3 bg-red-100/80 border border-red-200 text-red-700 rounded-lg text-sm backdrop-blur-sm relative z-10">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 relative z-10"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
              Phone Number
            </label>
            <div className="relative">
              <FaPhoneAlt className="absolute top-3.5 left-3 text-gray-400" />
              <input
                {...register("phone")}
                type="tel"
                placeholder="e.g. 9999999999"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all duration-300 shadow-inner"
              />
            </div>
            <p className="text-red-500 text-xs mt-1 pl-1">
              {errors.phone?.message}
            </p>
          </div>

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
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all duration-300 shadow-inner"
              />
            </div>
            <p className="text-red-500 text-xs mt-1 pl-1">
              {errors.password?.message}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gray-800 to-black text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? "Authenticating..." : "Login to Dashboard"}
          </button>
        </form>

        <div className="mt-8 relative z-10 text-center">
          <a
            href="/"
            className="text-sm text-gray-500 hover:text-slate-800 font-medium hover:underline transition-colors"
          >
            ← Back to Main Site
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
