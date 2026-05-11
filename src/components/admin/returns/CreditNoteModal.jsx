import React from "react";
import PropTypes from "prop-types"; // 🟢 Added PropTypes import
import { FaTimes, FaPrint, FaCheckCircle, FaLandmark } from "react-icons/fa";

const CreditNoteModal = ({ data, onClose }) => {
  if (!data) return null;

  // Change ID prefix from CN (Credit Note) to REF (Refund)
  const refundId = `REF-${data.orderId}-${data.itemId}`;
  const refundDate = new Date(data.lastUpdated).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z- p-4"
      style={{ zIndex: 9999 }}
    >
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gray-900 text-white p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-widest">
              Refund Receipt
            </h2>
            <p className="text-gray-400 text-sm mt-1">Ref: {refundId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          {/* Status Badge */}
          <div className="flex justify-center mb-8">
            <div className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 border border-green-200">
              <FaCheckCircle /> SUCCESSFULLY REFUNDED
            </div>
          </div>

          {/* Amount Section */}
          <div className="text-center mb-8">
            <p className="text-gray-500 uppercase text-xs font-bold tracking-wider mb-2">
              Refund Amount
            </p>
            <div className="text-5xl font-extrabold text-gray-900 flex justify-center items-start">
              <span className="text-2xl mt-2 mr-1">₹</span>
              {data.amountToRefund}
            </div>
            <p className="text-blue-600 text-sm font-medium mt-3 flex items-center justify-center gap-1.5">
              <FaLandmark /> Refunded to Original Payment Method
            </p>
          </div>

          {/* Details Table */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-500">Order ID</span>
              <span className="font-semibold text-gray-800">
                #{data.orderId}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-500">Date Processed</span>
              <span className="font-semibold text-gray-800">{refundDate}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-500">Item</span>
              <span className="font-semibold text-gray-800 text-right truncate w-48">
                {data.productName} (x{data.quantity})
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Reason</span>
              <span className="font-semibold text-gray-800">{data.reason}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 flex justify-end border-t border-gray-100">
          <button
            // 🟢 Fix: Prefer globalThis over window
            onClick={() => globalThis.print()}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition"
          >
            <FaPrint /> Print
          </button>
          <button
            onClick={onClose}
            className="ml-2 px-6 py-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// 🟢 Fix: Added comprehensive PropTypes validation mapping the nested 'data' object
CreditNoteModal.propTypes = {
  data: PropTypes.shape({
    orderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    itemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    lastUpdated: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]).isRequired,
    amountToRefund: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    quantity: PropTypes.number.isRequired,
    productName: PropTypes.string.isRequired,
    reason: PropTypes.string.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
};

export default CreditNoteModal;
