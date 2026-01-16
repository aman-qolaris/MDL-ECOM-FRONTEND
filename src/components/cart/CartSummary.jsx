import { memo } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

const CartSummary = ({ cartTotal, shippingCost, grandTotal, onCheckout }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:sticky lg:top-24">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Order Summary</h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium">₹{cartTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          {shippingCost === 0 ? (
            <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded text-sm">
              Free
            </span>
          ) : (
            <span className="font-medium">
              ₹{shippingCost.toLocaleString()}
            </span>
          )}
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax (GST)</span>
          <span className="font-medium">₹0.00</span>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-200 pt-4 mb-6">
        <div className="flex justify-between items-end">
          <span className="text-gray-800 font-bold">Total</span>
          <span className="text-2xl font-extrabold text-blue-600">
            ₹{grandTotal.toLocaleString()}
          </span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all flex items-center justify-center gap-2"
      >
        Proceed to Checkout <FaArrowRight />
      </button>

      <Link
        to="/shop"
        className="block text-center mt-4 text-sm text-gray-500 hover:text-gray-800 font-medium transition"
      >
        Or Continue Shopping
      </Link>
    </div>
  );
};

export default memo(CartSummary);
