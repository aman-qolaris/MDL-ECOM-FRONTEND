import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";

const CancelRequestModal = ({ isOpen, onClose, onSubmit, loading, title }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const cancelReasons = [
    "I changed my mind",
    "Found a better price elsewhere",
    "Ordered by mistake",
    "Delivery is taking too long",
    "Other",
  ];

  // Optional: Reset reason when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!reason) {
      setError("Please select a reason for cancellation.");
      return;
    }

    setError("");
    onSubmit(reason);
  };

  return (
    <div
      // 🟢 FIX: Cleaned up the broken 'z-' class and moved inline style to Tailwind arbitrary value
      className="fixed inset-0 z- flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-red-50/50">
          <h3 className="text-xl font-bold text-gray-800">
            {title || "Cancel Order"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-200 rounded p-1"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Warning */}
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl flex items-start gap-3 mb-6 text-sm border border-yellow-200/50">
            <FaExclamationTriangle className="mt-0.5 shrink-0 text-yellow-600" />
            <p>
              Are you sure you want to proceed with this cancellation?
              <br className="mb-1" />
              <span className="opacity-90">
                Refunds for pre-paid orders will be processed automatically to
                your original payment method.
              </span>
            </p>
          </div>

          {/* Reasons */}
          <div className="space-y-4 mb-6">
            <label className="block text-sm font-bold text-gray-700">
              Reason for Cancellation <span className="text-red-500">*</span>
            </label>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {cancelReasons.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                    reason === r
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={r}
                    checked={reason === r}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700">{r}</span>
                </label>
              ))}
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-xs font-semibold animate-shake">
                {error}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Keep It
            </button>

            <button
              type="submit"
              disabled={loading || !reason}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex justify-center items-center shadow-md shadow-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {loading ? "Cancelling..." : "Confirm Cancel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

CancelRequestModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  title: PropTypes.string,
};

export default CancelRequestModal;
