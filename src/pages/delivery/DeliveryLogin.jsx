import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTruck, FaPhoneAlt, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { loginDeliveryBoy } from "../../services/orderService";

const DeliveryLogin = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ✅ 1. Input Handler to Enforce 10-Digit Limit
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and max length 10
    if (/^\d{0,10}$/.test(value)) {
      setPhone(value);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // 2. Basic Client-side Validation
    if (!phone || !password) {
      setError("Please fill in all fields");
      return;
    }

    // ✅ 3. Strict 10-Digit Check
    if (phone.length !== 10) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }

    setLoading(true);

    try {
      const data = await loginDeliveryBoy(phone, password);

      // Save Token & Info
      localStorage.setItem("deliveryToken", data.token);
      localStorage.setItem("deliveryBoy", JSON.stringify(data.boy));

      navigate("/delivery/dashboard");
    } catch (err) {
      console.error(err);
      if (err.validationErrors) {
        const formattedErrors = err.validationErrors
          .map((zError) => zError.message)
          .join(" | ");
        setError(formattedErrors);
      } else {
        setError(
          err.response?.data?.message ||
            "Invalid Credentials. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] p-4 relative overflow-hidden">
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/50 relative z-10 animate-fadeIn">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-tr from-green-100 to-emerald-100 p-4 rounded-full text-green-600 shadow-md ring-4 ring-white/50">
            <FaTruck size={32} />
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">
          Delivery Partner
        </h2>
        <p className="text-center text-gray-500 mb-8 text-sm">
          Welcome back! Please login to your account.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-medium animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Phone Number Field */}
          <div>
            {/* ✅ FIX: Added htmlFor linking to input id */}
            <label
              htmlFor="delivery-phone"
              className="block text-sm font-semibold text-gray-700 mb-2 pl-1"
            >
              Phone Number
            </label>
            <div className="relative group">
              <FaPhoneAlt className="absolute top-3.5 left-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
              <input
                id="delivery-phone" // ✅ FIX: Matches htmlFor above
                type="text"
                required
                maxLength="10"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all duration-300 shadow-sm"
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={handlePhoneChange}
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            {/* ✅ FIX: Added htmlFor linking to input id */}
            <label
              htmlFor="delivery-password"
              className="block text-sm font-semibold text-gray-700 mb-2 pl-1"
            >
              Password
            </label>
            <div className="relative group">
              <FaLock className="absolute top-3.5 left-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
              <input
                id="delivery-password" // ✅ FIX: Matches htmlFor above
                type={showPassword ? "text" : "password"}
                required
                className="w-full pl-11 pr-12 py-3 rounded-xl bg-gray-50/50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all duration-300 shadow-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-3.5 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"} // ✅ bonus: fixes icon-only button accessibility
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-green-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Verifying...</span>
              </>
            ) : (
              "Login to Dashboard"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Forgot Credentials?{" "}
            <span className="text-green-600 font-semibold cursor-pointer hover:underline hover:text-green-700 transition-colors">
              Contact Admin
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryLogin;
