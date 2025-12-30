import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
// Added extra icons for the modern input fields
import {
  FaStore,
  FaUser,
  FaFileInvoiceDollar,
  FaEnvelope,
  FaPhoneAlt,
  FaLock,
  FaIdCard,
  FaMapMarkerAlt,
  FaClock,
  FaUniversity,
  FaMoneyCheckAlt,
  FaBuilding,
} from "react-icons/fa";
import api from "../../services/api"; // ✅ Your configured API instance

// === VALIDATION SCHEMA (UNCHANGED) ===
const schema = yup
  .object({
    // 1. Personal Details
    name: yup.string().required("Full Name is required"),
    email: yup
      .string()
      .email("Invalid email format")
      .required("Email is required"),
    phone: yup
      .string()
      .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
      .required("Phone number is required"),
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
    aadhar: yup
      .string()
      .matches(/^\d{12}$/, "Aadhar number must be exactly 12 digits")
      .required("Aadhar number is required"),

    // 2. Business Information
    businessName: yup.string().required("Business Name is required"),
    businessType: yup.string().required("Business Type is required"),
    businessAddress: yup.string().required("Physical Address is required"),
    yearsInBusiness: yup
      .number()
      .typeError("Must be a valid number")
      .min(0, "Cannot be negative")
      .required("Years in business is required"),

    // 3. Legal & Banking
    pan: yup
      .string()
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format")
      .required("PAN Number is required"),
    gst: yup
      .string()
      .min(15, "GST must be 15 characters")
      .max(15, "GST must be 15 characters")
      .required("GST Number is required"),
    bankName: yup.string().required("Bank Name is required"),
    ifscCode: yup
      .string()
      .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC Code format")
      .required("IFSC Code is required"),
    bankHolderName: yup.string().required("Account Holder Name is required"),
    bankAccount: yup
      .string()
      .min(9, "Account number too short")
      .max(18, "Account number too long")
      .required("Bank Account Number is required"),
  })
  .required();

const VendorRegister = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      businessType: "Retail",
    },
  });

  const onSubmit = async (data) => {
    try {
      // 1. MAP FRONTEND NAMES -> BACKEND NAMES
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        aadharNumber: data.aadhar,
        panNumber: data.pan,
        gstNumber: data.gst,
        businessName: data.businessName,
        businessType: data.businessType,
        businessAddress: data.businessAddress,
        yearsInBusiness: Number(data.yearsInBusiness),
        bankAccountHolderName: data.bankHolderName,
        bankAccountNumber: data.bankAccount,
        bankIFSC: data.ifscCode,
        bankName: data.bankName,
      };

      console.log("Sending payload to backend:", payload);

      const response = await api.post("/vendor/register", payload);

      if (response.status === 200 || response.status === 201) {
        alert(
          "Application Submitted! Your account is under review (Pending Approval)."
        );
        navigate("/vendor/login");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      alert(errorMsg);
    }
  };

  return (
    // Outer Container with Animation
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 animate-fadeIn flex justify-center">
      {/* GLASS CARD */}
      <div className="max-w-4xl w-full bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden relative">
        {/* Decorative Background Blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none"></div>

        {/* Header Section */}
        <div className="bg-white/40 border-b border-white/50 px-8 py-8 text-center relative z-10">
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            Vendor Registration
          </h2>
          <p className="text-purple-600 mt-2 font-medium">
            Join our marketplace and start selling today.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-8 space-y-8 relative z-10"
        >
          {/* --- 1. PERSONAL DETAILS --- */}
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
                    className="input-glass pl-10"
                    placeholder="9876543210"
                  />
                </div>
                <p className="error-text">{errors.phone?.message}</p>
              </div>
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                  Password *
                </label>
                <div className="relative">
                  <FaLock className="absolute top-3.5 left-3 text-gray-400" />
                  <input
                    type="password"
                    {...register("password")}
                    className="input-glass pl-10"
                    placeholder="••••••••"
                  />
                </div>
                <p className="error-text">{errors.password?.message}</p>
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
                    className="input-glass pl-10"
                    placeholder="12-digit UID"
                  />
                </div>
                <p className="error-text">{errors.aadhar?.message}</p>
              </div>
            </div>
          </div>

          {/* --- 2. BUSINESS INFORMATION --- */}
          <div>
            <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2 border-b border-gray-200/50 pb-2 mb-6">
              <FaStore className="text-purple-600" /> Business Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                  Business Name *
                </label>
                <div className="relative">
                  <FaBuilding className="absolute top-3.5 left-3 text-gray-400" />
                  <input
                    type="text"
                    {...register("businessName")}
                    className="input-glass pl-10"
                    placeholder="My Awesome Store"
                  />
                </div>
                <p className="error-text">{errors.businessName?.message}</p>
              </div>
              {/* Business Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                  Business Type *
                </label>
                <div className="relative">
                  <FaStore className="absolute top-3.5 left-3 text-gray-400" />
                  <select
                    {...register("businessType")}
                    className="input-glass pl-10 appearance-none"
                  >
                    <option value="Retail">Retailer</option>
                    <option value="Wholesale">Wholesaler</option>
                    <option value="Manufacturer">Manufacturer</option>
                  </select>
                </div>
                <p className="error-text">{errors.businessType?.message}</p>
              </div>
              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                  Physical Address *
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute top-3.5 left-3 text-gray-400" />
                  <textarea
                    {...register("businessAddress")}
                    rows="2"
                    className="input-glass pl-10"
                    placeholder="Shop No, Street, City..."
                  ></textarea>
                </div>
                <p className="error-text">{errors.businessAddress?.message}</p>
              </div>
              {/* Years in Business */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                  Years in Business *
                </label>
                <div className="relative">
                  <FaClock className="absolute top-3.5 left-3 text-gray-400" />
                  <input
                    type="number"
                    {...register("yearsInBusiness")}
                    className="input-glass pl-10"
                    placeholder="e.g. 5"
                  />
                </div>
                <p className="error-text">{errors.yearsInBusiness?.message}</p>
              </div>
            </div>
          </div>

          {/* --- 3. LEGAL & BANKING --- */}
          <div>
            <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2 border-b border-gray-200/50 pb-2 mb-6">
              <FaFileInvoiceDollar className="text-purple-600" /> Legal &
              Banking
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PAN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                  PAN Number *
                </label>
                <div className="relative">
                  <FaIdCard className="absolute top-3.5 left-3 text-gray-400" />
                  <input
                    type="text"
                    {...register("pan")}
                    className="input-glass pl-10 uppercase"
                    placeholder="ABCDE1234F"
                  />
                </div>
                <p className="error-text">{errors.pan?.message}</p>
              </div>
              {/* GST */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                  GST Number *
                </label>
                <div className="relative">
                  <FaFileInvoiceDollar className="absolute top-3.5 left-3 text-gray-400" />
                  <input
                    type="text"
                    {...register("gst")}
                    className="input-glass pl-10 uppercase"
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
                <p className="error-text">{errors.gst?.message}</p>
              </div>
              {/* Bank Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                  Bank Name *
                </label>
                <div className="relative">
                  <FaUniversity className="absolute top-3.5 left-3 text-gray-400" />
                  <input
                    type="text"
                    {...register("bankName")}
                    className="input-glass pl-10"
                    placeholder="SBI, HDFC, etc."
                  />
                </div>
                <p className="error-text">{errors.bankName?.message}</p>
              </div>
              {/* IFSC */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                  IFSC Code *
                </label>
                <div className="relative">
                  <FaBuilding className="absolute top-3.5 left-3 text-gray-400" />
                  <input
                    type="text"
                    {...register("ifscCode")}
                    className="input-glass pl-10 uppercase"
                    placeholder="SBIN0001234"
                  />
                </div>
                <p className="error-text">{errors.ifscCode?.message}</p>
              </div>
              {/* Holder Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                  Account Holder Name *
                </label>
                <div className="relative">
                  <FaUser className="absolute top-3.5 left-3 text-gray-400" />
                  <input
                    type="text"
                    {...register("bankHolderName")}
                    className="input-glass pl-10"
                    placeholder="Name as per Bank"
                  />
                </div>
                <p className="error-text">{errors.bankHolderName?.message}</p>
              </div>
              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                  Bank Account Number *
                </label>
                <div className="relative">
                  <FaMoneyCheckAlt className="absolute top-3.5 left-3 text-gray-400" />
                  <input
                    type="password"
                    {...register("bankAccount")}
                    className="input-glass pl-10"
                    placeholder="Account Number"
                  />
                </div>
                <p className="error-text">{errors.bankAccount?.message}</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full text-white font-bold py-4 rounded-xl shadow-lg text-lg transition-all duration-300 transform hover:scale-[1.01] hover:shadow-xl ${
                isSubmitting
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600"
              }`}
            >
              {isSubmitting
                ? "Submitting Application..."
                : "Submit Application for Review"}
            </button>
          </div>
        </form>

        <div className="text-center py-6 bg-white/30 border-t border-white/50">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-purple-700 font-bold hover:underline"
          >
            Login here
          </Link>
        </div>
      </div>

      {/* Tailwind Utility for Inputs (You can add this to your index.css or keep inline) */}
      <style>{`
        .input-glass {
          width: 100%;
          padding-right: 1rem;
          padding-top: 0.75rem;
          padding-bottom: 0.75rem;
          border-radius: 0.75rem;
          background-color: rgba(255, 255, 255, 0.5);
          border: 1px solid #e5e7eb;
          transition: all 0.3s;
          box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
          outline: none;
        }
        .input-glass:focus {
          background-color: #ffffff;
          ring: 2px;
          ring-color: #a855f7;
          border-color: transparent;
        }
        .error-text {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 0.25rem;
          padding-left: 0.25rem;
        }
      `}</style>
    </div>
  );
};

export default VendorRegister;
