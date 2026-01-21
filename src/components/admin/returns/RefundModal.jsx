import {
  FaWallet,
  FaCheckCircle,
  FaRupeeSign,
  FaTimes,
  FaArrowRight,
} from "react-icons/fa";

const RefundModal = ({ request, onClose, onConfirm }) => {
  if (!request) return null;

  const refundAmount =
    request.amountToRefund || request.price * request.quantity || 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-purple-600 p-6 text-white flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaWallet /> Create Credit Note
            </h2>
            <p className="text-purple-100 text-sm mt-1">
              Refund to Customer Wallet
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Refund Amount */}
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 text-center">
            <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">
              Credit Amount
            </p>
            <p className="text-4xl font-extrabold text-purple-700 mt-2">
              ₹{refundAmount}
            </p>
          </div>

          {/* Info Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-2 rounded-full text-purple-600 mt-1">
                <FaArrowRight size={12} />
              </div>
              <p>
                This amount will be instantly added to
                <span className="font-bold text-gray-800">
                  {" "}
                  {request.customerName}'s{" "}
                </span>
                Wallet. They can use it for future orders.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => onConfirm(request.orderId, request.itemId)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <FaCheckCircle /> Generate Credit Note
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefundModal;
