import { useState } from "react";
import {
  FaUniversity,
  FaCopy,
  FaCheckCircle,
  FaRupeeSign,
  FaTimes,
} from "react-icons/fa";

const RefundModal = ({ request, onClose, onConfirm }) => {
  const [copied, setCopied] = useState("");

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(""), 2000);
  };

  if (!request) return null;

  // Handle both nested object (backend standard) or flat object (your custom query)
  const bankName = request.User?.bankName || request.bankName;
  const accountNumber = request.User?.accountNumber || request.accountNumber;
  const ifscCode = request.User?.ifscCode || request.ifscCode;
  const refundAmount =
    request.amountToRefund || request.price * request.quantity || 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaRupeeSign /> Process Refund
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Verify bank details and transfer funds.
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Refund Amount */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
            <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">
              Refund Amount
            </p>
            <p className="text-3xl font-extrabold text-blue-600 mt-1">
              ₹{refundAmount}
            </p>
          </div>

          {/* Bank Details Table */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <FaUniversity className="text-gray-400" /> Customer Bank Details
            </h3>

            {accountNumber ? (
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-500 text-sm">Bank Name</span>
                  <span className="font-semibold text-gray-800">
                    {bankName}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-500 text-sm">Account No.</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-gray-800">
                      {accountNumber}
                    </span>
                    <button
                      onClick={() => handleCopy(accountNumber, "acc")}
                      className="text-blue-600 hover:text-blue-800 transition"
                      title="Copy"
                    >
                      {copied === "acc" ? (
                        <FaCheckCircle className="text-green-500" />
                      ) : (
                        <FaCopy />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">IFSC Code</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-gray-800">
                      {ifscCode}
                    </span>
                    <button
                      onClick={() => handleCopy(ifscCode, "ifsc")}
                      className="text-blue-600 hover:text-blue-800 transition"
                      title="Copy"
                    >
                      {copied === "ifsc" ? (
                        <FaCheckCircle className="text-green-500" />
                      ) : (
                        <FaCopy />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm text-center">
                User has not provided bank details.
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={() => onConfirm(request.orderId, request.itemId)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <FaCheckCircle /> Confirm Payment Sent
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefundModal;
