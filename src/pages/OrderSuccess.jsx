import { Link, useLocation } from "react-router-dom";
import { FaCheckCircle, FaBoxOpen } from "react-icons/fa";

const OrderSuccess = () => {
  const location = useLocation();
  const orderId = location.state?.orderId || "N/A";
  const orderDetails = location.state?.orderDetails || null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full border border-gray-100 animate-fadeIn">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaCheckCircle className="text-green-500 text-4xl" />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed!</h1>
        <p className="text-gray-500 mb-2">
          Thank you for your purchase. Your order has been received and is being
          processed.
        </p>

        {/* Order ID */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Order ID</p>
          <p className="font-mono font-bold text-blue-600">{orderId}</p>
        </div>

        {/* Order Summary if available */}
        {orderDetails && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Order Summary
            </p>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Items:</span>
                <span className="font-medium">
                  {orderDetails.itemCount || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-bold text-gray-800">
                  ₹{orderDetails.totalAmount || 0}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to="/profile"
            state={{ activeTab: "orders" }}
            className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <FaBoxOpen />
            View Order History
          </Link>

          <Link
            to="/shop"
            className="block w-full bg-white border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
