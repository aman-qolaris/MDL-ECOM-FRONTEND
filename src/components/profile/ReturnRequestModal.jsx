import { useState } from "react";
import { FaTimes, FaUndoAlt, FaExclamationCircle } from "react-icons/fa";

// Ensure this matches your actual service import path
import { requestReturn } from "../../services/orderService";

const ReturnRequestModal = ({ order, item, onClose, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    if (!reason) {
      setError("Please select a reason for the return.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Call your backend to update status to RETURN_REQUESTED
      await requestReturn(order.id, item.id, {
        reason: reason === "Other" ? comments : reason,
        comments,
      });
      onSuccess(); // Close modal and refresh the order list
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-orange-50/50">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaUndoAlt className="text-orange-500" /> Request Return
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-orange-500 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex items-start gap-3 mb-6 text-sm border border-blue-200/50">
            <FaExclamationCircle className="mt-0.5 shrink-0 text-blue-600" />
            <p>
              You are requesting a return for Order <strong>#{order.id}</strong>
              .
              <br className="mb-1" />
              <span className="opacity-90">
                Once approved, refunds for online payments are credited to the
                original payment source. For COD orders, our team will contact
                you.
              </span>
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <label className="block text-sm font-bold text-gray-700">
              Why are you returning this?{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
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
                    className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">{r}</span>
                </label>
              ))}
            </div>

            {reason === "Other" && (
              <div className="mt-3 animate-fadeIn">
                <textarea
                  placeholder="Please specify the reason..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
                  rows="3"
                  required
                ></textarea>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-xs font-semibold animate-shake">
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors disabled:opacity-50 flex justify-center items-center shadow-md shadow-orange-500/20"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnRequestModal;
