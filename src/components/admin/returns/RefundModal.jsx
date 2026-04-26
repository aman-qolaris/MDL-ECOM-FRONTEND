import { FaUndo, FaCheckCircle, FaTimes, FaArrowRight } from "react-icons/fa";

const RefundModal = ({ request, onClose, onConfirm }) => {
  if (!request) return null;

  const refundAmount =
    request.amountToRefund || request.price * request.quantity || 0;

  // Determine if it was prepaid based on your backend data
  const isPrepaid = request.paymentMethod && request.paymentMethod !== "COD";

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z- p-4"
      style={{ zIndex: 9999 }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaUndo /> Process Refund
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {isPrepaid ? "Refund to Original Source" : "Manual Bank Transfer"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Refund Amount */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center">
            <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">
              Refund Amount
            </p>
            <p className="text-4xl font-extrabold text-blue-700 mt-2">
              ₹{refundAmount}
            </p>
          </div>

          {/* Info Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full text-blue-600 mt-1 shrink-0">
                <FaArrowRight size={12} />
              </div>
              <p>
                {isPrepaid ? (
                  <>
                    This amount will be refunded to{" "}
                    <span className="font-bold text-gray-800">
                      {request.customerName}'s
                    </span>{" "}
                    original payment method.
                  </>
                ) : (
                  <>
                    This was a COD order. Ensure you have manually transferred
                    the amount to{" "}
                    <span className="font-bold text-gray-800">
                      {request.customerName}'s
                    </span>{" "}
                    bank account before confirming.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => onConfirm(request.orderId, request.itemId)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <FaCheckCircle /> Confirm Refund
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefundModal;
