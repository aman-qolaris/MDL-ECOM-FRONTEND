import React from "react";
import PropTypes from "prop-types"; // 🟢 Added PropTypes import

const SummaryBar = ({
  subtotal,
  shippingCost,
  totalPayable,
  placeOrder,
  loading,
  cartLength,
  hasSelectedAddress,
}) => {
  return (
    <div className="mt-6 pt-6 border-t bg-gray-50 -mx-5 -mb-5 p-5 rounded-b-xl flex flex-col md:flex-row justify-between items-center">
      <div className="mb-4 md:mb-0">
        <p className="text-gray-500 text-sm">Payment Method</p>
        <div className="flex items-center mt-1">
          <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded border border-green-200">
            COD
          </span>
          <span className="ml-2 text-sm font-semibold text-gray-700">
            Cash on Delivery
          </span>
        </div>
      </div>

      <div className="text-right flex items-center gap-6">
        <div className="text-sm space-y-1">
          <p className="text-gray-500">
            Subtotal:{" "}
            <span className="font-medium text-gray-800">₹{subtotal}</span>
          </p>
          <p className="text-gray-500">
            Shipping:{" "}
            <span className="font-medium text-green-600">
              {shippingCost > 0 ? `+ ₹${shippingCost}` : "Free"}
            </span>
          </p>
          <p className="text-lg font-bold text-gray-800 border-t pt-1 mt-1">
            Total: ₹{totalPayable}
          </p>
        </div>

        <button
          onClick={placeOrder}
          disabled={loading || cartLength === 0 || !hasSelectedAddress}
          className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all transform active:scale-95"
        >
          {loading ? "Placing..." : "Confirm Order"}
        </button>
      </div>
    </div>
  );
};

// 🟢 Fix: Added comprehensive PropTypes validation
SummaryBar.propTypes = {
  subtotal: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  shippingCost: PropTypes.number.isRequired,
  totalPayable: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  placeOrder: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  cartLength: PropTypes.number.isRequired,
  hasSelectedAddress: PropTypes.bool.isRequired,
};

export default SummaryBar;
