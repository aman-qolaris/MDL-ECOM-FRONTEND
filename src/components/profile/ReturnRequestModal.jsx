import { useState } from "react";
import PropTypes from "prop-types";
import {
  FaTimes,
  FaUndoAlt,
  FaExclamationCircle,
  FaUniversity,
  FaStore,
} from "react-icons/fa";
import { requestReturn } from "../../services/orderService";

const ReturnRequestModal = ({ order, orderId, item, onClose, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");

  const [refundMethod, setRefundMethod] = useState("");
  const [bankDetails, setBankDetails] = useState({
    accountNo: "",
    ifsc: "",
    bankName: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isCashPayment = order?.paymentMethod === "COD";

  const finalOrderId = item?.orderId || order?.id || orderId;

  const returnReasons = [
    "Received wrong item",
    "Item was damaged or defective",
    "Item doesn't match the description",
    "Quality is not as expected",
    "Missing parts or accessories",
    "Other",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Safety check before calling backend
    if (!finalOrderId) {
      setError("Error: Order ID is missing. Please refresh the page.");
      return;
    }

    if (!reason) {
      setError("Please select a reason for the return.");
      return;
    }

    if (isCashPayment) {
      if (!refundMethod) {
        setError("Please select how you want to receive your refund.");
        return;
      }
      if (
        refundMethod === "BANK_TRANSFER" &&
        (!bankDetails.accountNo || !bankDetails.ifsc || !bankDetails.bankName)
      ) {
        setError("Please fill in all bank details.");
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      await requestReturn(finalOrderId, item?.id, {
        reason: reason === "Other" ? comments : reason,
        refundMethod: isCashPayment ? refundMethod : "ORIGINAL_SOURCE",
        bankDetails:
          isCashPayment && refundMethod === "BANK_TRANSFER"
            ? bankDetails
            : null,
      });
      globalThis.alert(
        "Return requested successfully! Refund will be processed after Admin verification.",
      );
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit return request. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-orange-50/50 sticky top-0 z-10">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaUndoAlt className="text-orange-500" /> Request Return
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-200 rounded p-1"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex items-start gap-3 mb-6 text-sm border border-blue-200/50">
            <FaExclamationCircle className="mt-0.5 shrink-0 text-blue-600" />
            <p>
              You are requesting a return for Order{" "}
              <strong>#{finalOrderId}</strong>.
              <br className="mb-1" />
              <span className="opacity-90">
                {isCashPayment
                  ? "Since you paid via Cash/COD, please specify how you would like to receive your refund below."
                  : "Once approved, the refund will be automatically credited to your original payment source."}
              </span>
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <label className="block text-sm font-bold text-gray-700">
              Why are you returning this?{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {returnReasons.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                    reason === r
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="returnReason"
                    value={r}
                    checked={reason === r}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-4 h-4 text-orange-600 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700">{r}</span>
                </label>
              ))}
            </div>

            {reason === "Other" && (
              <textarea
                placeholder="Please specify the reason..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none mt-2 resize-none"
                rows="3"
                required
              />
            )}
          </div>

          {isCashPayment && (
            <div className="space-y-4 mb-6 pt-4 border-t border-gray-100">
              <label className="block text-sm font-bold text-gray-700">
                How do you want your refund?{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex flex-col items-center justify-center p-3 border rounded-xl cursor-pointer text-center ${
                    refundMethod === "BANK_TRANSFER"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    className="hidden"
                    checked={refundMethod === "BANK_TRANSFER"}
                    onChange={() => setRefundMethod("BANK_TRANSFER")}
                  />
                  <FaUniversity size={20} className="mb-2" />
                  <span className="text-xs font-bold">Bank Transfer</span>
                </label>
                <label
                  className={`flex flex-col items-center justify-center p-3 border rounded-xl cursor-pointer text-center ${
                    refundMethod === "WAREHOUSE_COLLECT"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    className="hidden"
                    checked={refundMethod === "WAREHOUSE_COLLECT"}
                    onChange={() => setRefundMethod("WAREHOUSE_COLLECT")}
                  />
                  <FaStore size={20} className="mb-2" />
                  <span className="text-xs font-bold">Collect from Store</span>
                </label>
              </div>

              {refundMethod === "BANK_TRANSFER" && (
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200 mt-3">
                  <input
                    type="text"
                    placeholder="Bank Name (e.g. HDFC)"
                    value={bankDetails.bankName}
                    onChange={(e) =>
                      setBankDetails({
                        ...bankDetails,
                        bankName: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={bankDetails.accountNo}
                    onChange={(e) =>
                      setBankDetails({
                        ...bankDetails,
                        accountNo: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="IFSC Code"
                    value={bankDetails.ifsc}
                    onChange={(e) =>
                      setBankDetails({ ...bankDetails, ifsc: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-red-500 text-xs font-semibold mb-4 text-center">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ReturnRequestModal.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    paymentMethod: PropTypes.string,
  }),
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    orderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  orderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default ReturnRequestModal;
