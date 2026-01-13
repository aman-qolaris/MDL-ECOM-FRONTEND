/* eslint-disable react/prop-types */
import {
  FaUniversity,
  FaFileInvoice,
  FaMoneyCheckAlt,
  FaUser,
} from "react-icons/fa";

const LegalBankingForm = ({ register, errors }) => {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2 border-b border-gray-200/50 pb-2 mb-6">
        <FaUniversity className="text-purple-600" /> Legal & Banking
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PAN Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
            PAN Number *
          </label>
          <div className="relative">
            <FaFileInvoice className="absolute top-3.5 left-3 text-gray-400" />
            <input
              type="text"
              {...register("pan")}
              className="input-glass pl-10 uppercase"
              placeholder="ABCDE1234F"
            />
          </div>
          <p className="error-text">{errors.pan?.message}</p>
        </div>

        {/* GST Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
            GST Number *
          </label>
          <div className="relative">
            <FaFileInvoice className="absolute top-3.5 left-3 text-gray-400" />
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
              placeholder="HDFC Bank"
            />
          </div>
          <p className="error-text">{errors.bankName?.message}</p>
        </div>

        {/* IFSC Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
            IFSC Code *
          </label>
          <div className="relative">
            <div className="absolute top-3.5 left-3 text-gray-400 font-bold text-xs">
              IFSC
            </div>
            <input
              type="text"
              {...register("ifscCode")}
              className="input-glass pl-10 uppercase"
              placeholder="HDFC0001234"
            />
          </div>
          <p className="error-text">{errors.ifscCode?.message}</p>
        </div>

        {/* Account Holder Name */}
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
              placeholder="As per bank records"
            />
          </div>
          <p className="error-text">{errors.bankHolderName?.message}</p>
        </div>

        {/* Account Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
            Account Number *
          </label>
          <div className="relative">
            <FaMoneyCheckAlt className="absolute top-3.5 left-3 text-gray-400" />
            <input
              type="text"
              {...register("bankAccount")}
              className="input-glass pl-10"
              placeholder="Account Number"
            />
          </div>
          <p className="error-text">{errors.bankAccount?.message}</p>
        </div>
      </div>
    </div>
  );
};

export default LegalBankingForm;
