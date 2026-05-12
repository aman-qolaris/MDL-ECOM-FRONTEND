import React from "react";
import PropTypes from "prop-types";
import {
  FaUndo,
  FaCheckCircle,
  FaTimes,
  FaArrowRight,
  FaTruck,
  FaUniversity,
  FaStore,
} from "react-icons/fa";

const RefundModal = ({ request, onClose, onConfirm }) => {
  if (!request) return null;

  // 1. Calculate the base product price
  const basePrice = request.price * request.quantity;

  // 2. Get the exact refund amount from our updated backend
  const refundAmount = request.amountToRefund || basePrice || 0;

  // 3. Determine if shipping is included in this specific refund
  const includesShipping = refundAmount > basePrice;

  // 4. Payment & Refund Types
  const isPrepaid = request.paymentMethod && request.paymentMethod !== "COD";
  const isBankTransfer = request.refundMethod === "BANK_TRANSFER";
  const isWarehouseCollect = request.refundMethod === "WAREHOUSE_COLLECT";

  // 5. Safely parse Bank Details
  let parsedBankDetails = request.bankDetails;
  if (typeof parsedBankDetails === "string") {
    try {
      parsedBankDetails = JSON.parse(parsedBankDetails);
    } catch (e) {
      console.error("Failed to parse bank details", e);
      parsedBankDetails = null;
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        <div className="bg-blue-600 p-6 text-white flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaUndo /> Process Refund
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {isPrepaid ? "Refund to Original Source" : "Manual Refund"}
            </p>
          </div>
          <button
            type="button" // 🟢 Added type="button" for general a11y compliance
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded p-1"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center relative">
            <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">
              Refund Amount
            </p>
            <p className="text-4xl font-extrabold text-blue-700 mt-2">
              ₹{refundAmount}
            </p>

            {includesShipping && (
              <div className="mt-3 inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                <FaTruck /> Includes Shipping Charge
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full text-blue-600 mt-1 shrink-0">
                <FaArrowRight size={12} />
              </div>

              <div className="flex-1">
                {/* --- RAZORPAY / PREPAID --- */}
                {isPrepaid && (
                  <p>
                    This amount will be automatically refunded to{" "}
                    <span className="font-bold text-gray-800">
                      {request.customerName}&apos;s
                    </span>{" "}
                    original payment method via Razorpay.
                  </p>
                )}

                {/* --- CASH / STORE COLLECT --- */}
                {isWarehouseCollect && (
                  <div className="space-y-2">
                    <p>
                      Customer opted for{" "}
                      <strong className="text-gray-800 flex items-center gap-1 inline-flex">
                        <FaStore className="text-orange-500" /> Store Collection
                      </strong>
                      {/* 🟢 FIX: Moved the period inside a string block so it safely attaches to the end of the element without ambiguous spacing */}
                      {"."}
                    </p>
                    <p className="text-xs text-orange-700 font-bold bg-orange-100 p-2 rounded border border-orange-200">
                      Please hand over ₹{refundAmount} in cash when the customer
                      arrives.
                    </p>
                  </div>
                )}

                {/* --- CASH / BANK TRANSFER --- */}
                {isBankTransfer && (
                  <div className="space-y-3">
                    <p>
                      Customer requested a{" "}
                      <strong className="text-gray-800 flex items-center gap-1 inline-flex">
                        <FaUniversity className="text-blue-500" /> Bank Transfer
                      </strong>
                      {/* 🟢 FIX: Moved the period inside a string block */}
                      {"."}
                    </p>

                    {parsedBankDetails ? (
                      <div className="bg-white border border-gray-200 rounded-md p-3 text-sm shadow-sm font-mono text-gray-700">
                        <div className="flex justify-between mb-1.5 pb-1.5 border-b border-gray-100">
                          <span className="font-bold text-gray-500">Bank:</span>
                          <span className="font-semibold text-gray-800">
                            {parsedBankDetails.bankName}
                          </span>
                        </div>
                        <div className="flex justify-between mb-1.5 pb-1.5 border-b border-gray-100">
                          <span className="font-bold text-gray-500">
                            A/C No:
                          </span>
                          <span className="font-bold text-blue-600 tracking-wider">
                            {parsedBankDetails.accountNo}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold text-gray-500">IFSC:</span>
                          <span className="uppercase font-semibold">
                            {parsedBankDetails.ifsc}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-red-500 font-bold bg-red-50 p-2 rounded border border-red-100">
                        Bank details not provided by customer.
                      </p>
                    )}

                    <p className="text-xs text-red-600 font-bold">
                      ⚠️ Ensure you have manually transferred the amount before
                      confirming!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="button" // 🟢 Added type="button"
            onClick={() => onConfirm(request.orderId, request.itemId)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition transform hover:scale-[1.02] flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
          >
            <FaCheckCircle /> Confirm Refund Processed
          </button>
        </div>
      </div>
    </div>
  );
};

RefundModal.propTypes = {
  request: PropTypes.shape({
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    quantity: PropTypes.number.isRequired,
    amountToRefund: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    paymentMethod: PropTypes.string,
    refundMethod: PropTypes.string,
    customerName: PropTypes.string,
    orderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    itemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    bankDetails: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        bankName: PropTypes.string,
        accountNo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        ifsc: PropTypes.string,
      }),
    ]),
  }),
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default RefundModal;
