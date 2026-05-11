import PropTypes from "prop-types";
import { FaCreditCard, FaMapMarkerAlt } from "react-icons/fa";

const OrderAddressPaymentInfo = ({ order }) => {
  const shipping = Number.parseFloat(order.shippingCharge || 0);
  const credit = Number.parseFloat(order.creditApplied || 0);
  const payable = Number.parseFloat(order.amount || 0);

  // Logic: Payable + WalletUsed - Shipping = Item Price
  const itemSubtotal = payable + credit - shipping;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* --- Shipping Address Section (Unchanged) --- */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <FaMapMarkerAlt className="text-blue-600" /> Shipping Address
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 space-y-1 border border-gray-200">
          {order.address ? (
            <>
              <p className="font-bold text-gray-900">
                {order.address?.fullName}
              </p>
              <p>{order.address?.addressLine1}</p>
              <p>
                {order.address?.city}, {order.address?.state}
              </p>
              <p className="mt-2 text-gray-500">📞 {order.address?.phone}</p>
            </>
          ) : (
            <p className="italic text-gray-400">Address not available</p>
          )}
        </div>
      </div>

      {/* --- Payment Info Section (UPDATED) --- */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <FaCreditCard className="text-blue-600" /> Payment Info
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-3 border border-gray-200">
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method</span>
            <span className="font-medium text-gray-900 capitalize">
              {order.paymentMethod || "Card"}
            </span>
          </div>

          {/* 🟢 SHOW CALCULATED ITEM SUBTOTAL */}
          <div className="flex justify-between">
            <span className="text-gray-600">Item Subtotal</span>
            <span className="font-medium text-gray-900">
              ₹{itemSubtotal.toLocaleString()}
            </span>
          </div>

          {/* 🟢 DYNAMIC SHIPPING DISPLAY */}
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span
              className={`font-medium ${
                shipping > 0 ? "text-gray-900" : "text-green-600"
              }`}
            >
              {shipping > 0 ? `₹${shipping}` : "Free"}
            </span>
          </div>

          {/* 🟢 SHOW WALLET CREDIT IF USED */}
          {credit > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Wallet Credit</span>
              <span className="font-medium text-green-600">
                - ₹{credit.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex justify-between border-t border-gray-200 pt-2 mt-1">
            <span className="font-bold text-gray-800">Total Paid</span>
            <span className="font-bold text-blue-600 text-lg">
              ₹{payable.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

OrderAddressPaymentInfo.propTypes = {
  order: PropTypes.shape({
    shippingCharge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    creditApplied: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    paymentMethod: PropTypes.string,
    address: PropTypes.shape({
      fullName: PropTypes.string,
      addressLine1: PropTypes.string,
      state: PropTypes.string,
      city: PropTypes.string,
      phone: PropTypes.string,
    }),
  }).isRequired,
};

export default OrderAddressPaymentInfo;
