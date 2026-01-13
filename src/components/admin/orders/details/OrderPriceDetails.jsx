/* eslint-disable react/prop-types */
import { FaReceipt, FaRupeeSign, FaShippingFast } from "react-icons/fa";

const OrderPriceDetails = ({ priceDetails }) => {
  // 1. Safe calculations
  const subtotal = priceDetails.subtotal || 0;
  const total = priceDetails.total || 0;
  const shipping = total - subtotal;
  const tax = 0; // You can add logic here later if you implement tax separation

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <FaReceipt className="text-blue-500" />
        <h3 className="font-bold text-gray-800">Payment Summary</h3>
      </div>

      <div className="p-6 space-y-4">
        {/* Item Total */}
        <div className="flex justify-between text-gray-600 text-sm">
          <span>Item Total</span>
          <span className="font-medium">₹{subtotal.toLocaleString()}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-gray-600 text-sm items-center">
          <span className="flex items-center gap-2">
            Shipping <FaShippingFast className="text-gray-400" size={12} />
          </span>
          {shipping <= 0 ? (
            <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold uppercase">
              Free
            </span>
          ) : (
            <span className="font-medium">₹{shipping.toLocaleString()}</span>
          )}
        </div>

        {/* Tax (Optional Placeholder) */}
        <div className="flex justify-between text-gray-600 text-sm">
          <span>Tax (GST)</span>
          <span className="text-gray-400">Included</span>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gray-200 my-2"></div>

        {/* Grand Total */}
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="font-bold text-gray-800 text-lg">Grand Total</span>
            <span className="text-xs text-gray-400 font-normal">
              (Inclusive of all taxes)
            </span>
          </div>
          <div className="text-right">
            <span className="flex items-center text-2xl font-extrabold text-blue-600">
              <FaRupeeSign size={18} />
              {total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPriceDetails;
