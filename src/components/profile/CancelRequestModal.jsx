import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

const CancelRequestModal = ({ isOpen, onClose, onSubmit, loading, title }) => {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const CANCEL_REASONS = [
    "Ordered by mistake",
    "Changed my mind",
    "Found a better price",
    "Shipping time is too long",
    "Need to change shipping address",
    "Need to change payment method",
    "Other",
  ];

  const handleSubmit = () => {
    let finalReason = reason;

    if (!reason) return toast.error("Please select a reason.");

    if (reason === "Other") {
      if (!customReason.trim()) return toast.error("Please write a reason.");
      finalReason = customReason;
    }

    onSubmit(finalReason);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-bold text-lg text-red-600">
            {title || "Cancel Order"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <p className="text-gray-600 text-sm">
            Are you sure you want to cancel? Please select a reason below:
          </p>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Reason
            </label>
            <select
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">-- Select Reason --</option>
              {CANCEL_REASONS.map((r, i) => (
                <option key={i} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {reason === "Other" && (
            <div className="space-y-1 animate-fade-in">
              <textarea
                className="w-full p-2 border rounded-lg h-24 text-sm focus:ring-2 focus:ring-red-500"
                placeholder="Please describe why..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              ></textarea>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300 font-bold shadow-md transition"
          >
            {loading ? "Processing..." : "Confirm Cancellation"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelRequestModal;
