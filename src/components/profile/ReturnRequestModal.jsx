import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../services/api"; // Ensure you have your axios instance here

const ReturnRequestModal = ({ orderId, item, onClose, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Define Policies per Category
  const RETURN_REASONS = {
    Electronics: [
      "Device not working",
      "Physical Damage",
      "Wrong Item Received",
      "Box was empty",
    ],
    Fashion: [
      "Size Issue (Too Small/Big)",
      "Fabric Quality Bad",
      "Color Mismatch",
      "Wrong Item",
    ],
    "Home & Kitchen": ["Product Damaged", "Parts Missing", "Wrong Item"],
    Books: ["Torn Pages", "Wrong Edition", "Print Not Clear"],
    "Beauty & Personal care": [
      "Expired Product",
      "Seal Broken",
      "Allergic Reaction",
    ],
    Sports: ["Size Issue", "Damaged Equipment", "Wrong Item"],
    Default: ["Product Quality Issue", "Shipment Delayed", "Other"],
  };

  // Determine which list to show based on product category
  // Ensure your item.Product object has a 'category' field, or pass categoryName prop
  const categoryName = item.Product?.Category?.name || "Default";
  const reasonList = RETURN_REASONS[categoryName] || RETURN_REASONS["Default"];

  const handleSubmit = async () => {
    let finalReason = reason;

    // 2. Validation for 'Others'
    if (reason === "Others" || reason === "Other") {
      if (!customReason.trim()) return toast.error("Please write a reason.");

      const wordCount = customReason.trim().split(/\s+/).length;
      if (wordCount > 100)
        return toast.error("Reason must be under 100 words.");

      finalReason = `Others: ${customReason}`;
    }

    if (!finalReason) return toast.error("Please select a reason.");

    try {
      setLoading(true);
      await api.post(`/orders/${orderId}/items/${item.id}/return`, {
        reason: finalReason,
        categoryName: categoryName,
      });
      toast.success("Return Request Sent!");
      onSuccess(); // Refresh parent data
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request return");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-bold text-lg">Request Return</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg flex gap-3">
            {/* Show Product Image if available */}
            {item.Product?.imageUrl && (
              <img
                src={item.Product.imageUrl}
                alt=""
                className="w-12 h-12 object-cover rounded"
              />
            )}
            <div>
              <p className="font-medium line-clamp-1">
                {item.Product?.name || "Product"}
              </p>
              <p className="text-sm text-gray-500">Category: {categoryName}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Reason for Return
            </label>
            <select
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">-- Select Reason --</option>
              {reasonList.map((r, i) => (
                <option key={i} value={r}>
                  {r}
                </option>
              ))}
              <option value="Others">Others (Write your own)</option>
            </select>
          </div>

          {/* Conditional Text Area */}
          {(reason === "Others" || reason === "Other") && (
            <div className="space-y-1">
              <textarea
                className="w-full p-2 border rounded-lg h-24 text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your issue (max 100 words)..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              ></textarea>
              <p className="text-xs text-right text-gray-400">
                {customReason.split(/\s+/).filter((w) => w).length}/100 words
              </p>
            </div>
          )}

          <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded border border-yellow-200">
            <strong>Note:</strong> Items must be returned in original condition
            with box and tags. Pickup will be assigned after approval.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnRequestModal;
