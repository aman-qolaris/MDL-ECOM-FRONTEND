import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

import { registrationSchema } from "../../components/vendor/register/validationSchema";
import PersonalDetailsForm from "../../components/vendor/register/PersonalDetailsForm";
import BusinessInfoForm from "../../components/vendor/register/BusinessInfoForm";
import LegalBankingForm from "../../components/vendor/register/LegalBankingForm";

const VendorRegister = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(registrationSchema),
    mode: "onTouched", // Validates immediately on blur
    defaultValues: {
      businessType: "Retail",
    },
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        aadharNumber: data.aadhar,
        panNumber: data.pan.toUpperCase(),
        gstNumber: data.gst.toUpperCase(),
        businessName: data.businessName,
        businessType: data.businessType,
        businessAddress: data.businessAddress,
        yearsInBusiness: Number(data.yearsInBusiness),
        bankAccountHolderName: data.bankHolderName,
        bankAccountNumber: data.bankAccount,
        bankIFSC: data.ifscCode.toUpperCase(),
        bankName: data.bankName,
      };

      console.log("Sending payload to backend:", payload);
      const response = await api.post("/vendor/register", payload);

      if (response.status === 200 || response.status === 201) {
        alert("Application Submitted! Your account is under review.");
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 animate-fadeIn flex justify-center">
      <div className="max-w-4xl w-full bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none"></div>

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
          <PersonalDetailsForm register={register} errors={errors} />

          {/* --- 2. BUSINESS INFORMATION --- */}
          <BusinessInfoForm register={register} errors={errors} />

          {/* --- 3. LEGAL & BANKING --- */}
          <LegalBankingForm register={register} errors={errors} />

          {/* SUBMIT BUTTON */}
          <div className="pt-6 border-t border-gray-200/50">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform hover:scale-[1.01] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting Application..." : "Register Business"}
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/vendor/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorRegister;
