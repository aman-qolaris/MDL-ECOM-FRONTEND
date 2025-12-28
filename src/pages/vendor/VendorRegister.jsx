import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { FaStore, FaUser, FaFileInvoiceDollar } from "react-icons/fa";
import api from "../../services/api"; // ✅ Use your configured API instance

// === VALIDATION SCHEMA ===
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
      // The backend expects specific keys like "aadharNumber" instead of "aadhar"
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,

        // Mapped Fields
        aadharNumber: data.aadhar, // Backend: aadharNumber
        panNumber: data.pan, // Backend: panNumber
        gstNumber: data.gst, // Backend: gstNumber

        businessName: data.businessName,
        businessType: data.businessType,
        businessAddress: data.businessAddress,
        yearsInBusiness: Number(data.yearsInBusiness), // Ensure it's a number

        // Mapped Bank Fields
        bankAccountHolderName: data.bankHolderName, // Backend: bankAccountHolderName
        bankAccountNumber: data.bankAccount, // Backend: bankAccountNumber
        bankIFSC: data.ifscCode, // Backend: bankIFSC
        bankName: data.bankName,
      };

      console.log("Sending payload to backend:", payload);

      // 2. SEND ACTUAL REQUEST TO GATEWAY (Port 5007)
      // This hits: API Gateway -> Vendor Service -> Register Controller
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-purple-700 px-8 py-6 text-center">
          <h2 className="text-3xl font-extrabold text-white">
            Vendor Registration
          </h2>
          <p className="text-purple-200 mt-2">
            Join our marketplace and start selling today.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
          {/* --- PERSONAL --- */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b pb-2 mb-4">
              <FaUser className="text-purple-600" /> Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  {...register("name")}
                  className="mt-1 w-full border border-gray-300 p-2 rounded-lg"
                />
                <p className="text-red-500 text-xs">{errors.name?.message}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className="mt-1 w-full border border-gray-300 p-2 rounded-lg"
                />
                <p className="text-red-500 text-xs">{errors.email?.message}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  {...register("phone")}
                  className="mt-1 w-full border border-gray-300 p-2 rounded-lg"
                />
                <p className="text-red-500 text-xs">{errors.phone?.message}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <input
                  type="password"
                  {...register("password")}
                  className="mt-1 w-full border border-gray-300 p-2 rounded-lg"
                />
                <p className="text-red-500 text-xs">
                  {errors.password?.message}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Aadhar Number *
                </label>
                <input
                  type="text"
                  {...register("aadhar")}
                  className="mt-1 w-full border border-gray-300 p-2 rounded-lg"
                />
                <p className="text-red-500 text-xs">{errors.aadhar?.message}</p>
              </div>
            </div>
          </div>

          {/* --- BUSINESS --- */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b pb-2 mb-4">
              <FaStore className="text-purple-600" /> Business Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Business Name *
                </label>
                <input
                  type="text"
                  {...register("businessName")}
                  className="mt-1 w-full border border-gray-300 p-2 rounded-lg"
                />
                <p className="text-red-500 text-xs">
                  {errors.businessName?.message}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Business Type *
                </label>
                <select
                  {...register("businessType")}
                  className="mt-1 w-full border border-gray-300 p-2 rounded-lg"
                >
                  <option value="Retail">Retailer</option>
                  <option value="Wholesale">Wholesaler</option>
                  <option value="Manufacturer">Manufacturer</option>
                </select>
                <p className="text-red-500 text-xs">
                  {errors.businessType?.message}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Physical Address *
                </label>
                <textarea
                  {...register("businessAddress")}
                  rows="2"
                  className="mt-1 w-full border border-gray-300 p-2 rounded-lg"
                ></textarea>
                <p className="text-red-500 text-xs">
                  {errors.businessAddress?.message}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Years in Business *
                </label>
                <input
                  type="number"
                  {...register("yearsInBusiness")}
                  className="mt-1 w-full border border-gray-300 p-2 rounded-lg"
                />
                <p className="text-red-500 text-xs">
                  {errors.yearsInBusiness?.message}
                </p>
              </div>
            </div>
          </div>

          {/* --- LEGAL & BANKING --- */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b pb-2 mb-4">
              <FaFileInvoiceDollar className="text-purple-600" /> Legal &
              Banking
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  PAN Number *
                </label>
                <input
                  type="text"
                  {...register("pan")}
                  className="mt-1 w-full border border-gray-300 p-2 rounded-lg uppercase"
                />
                <p className="text-red-500 text-xs">{errors.pan?.message}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  GST Number *
                </label>
                <input
                  type="text"
                  {...register("gst")}
                  className="mt-1 w-full border border-gray-300 p-2 rounded-lg uppercase"
                />
                <p className="text-red-500 text-xs">{errors.gst?.message}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bank Name *
                </label>
                <input
                  type="text"
                  {...register("bankName")}
                  className="mt-1 w-full border border-gray-300 p-2 rounded-lg"
                />
                <p className="text-red-500 text-xs">
                  {errors.bankName?.message}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  IFSC Code *
                </label>
                <input
                  type="text"
                  {...register("ifscCode")}
                  className="mt-1 w-full border border-gray-300 p-2 rounded-lg uppercase"
                />
                <p className="text-red-500 text-xs">
                  {errors.ifscCode?.message}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  {...register("bankHolderName")}
                  className="mt-1 w-full border border-gray-300 p-2 rounded-lg"
                />
                <p className="text-red-500 text-xs">
                  {errors.bankHolderName?.message}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bank Account Number *
                </label>
                <input
                  type="password"
                  {...register("bankAccount")}
                  className="mt-1 w-full border border-gray-300 p-2 rounded-lg"
                />
                <p className="text-red-500 text-xs">
                  {errors.bankAccount?.message}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full text-white font-bold py-4 rounded-xl shadow-lg text-lg transition ${
                isSubmitting
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-700 hover:bg-purple-800"
              }`}
            >
              {isSubmitting
                ? "Submitting Application..."
                : "Submit Application for Review"}
            </button>
          </div>
        </form>

        <div className="text-center py-4">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-700 font-bold">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VendorRegister;
