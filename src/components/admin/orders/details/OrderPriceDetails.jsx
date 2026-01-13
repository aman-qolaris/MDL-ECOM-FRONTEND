/* eslint-disable react/prop-types */

const OrderPriceDetails = ({ priceDetails }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="font-bold text-gray-700 mb-4">Price Details</h3>
      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Product Total (Active Items)</span>
          <span className="font-medium">
            ₹{priceDetails.subtotal.toLocaleString()}
          </span>
        </div>
        <div className="border-t pt-3 mt-2 flex justify-between font-bold text-lg text-gray-800">
          <span>Grand Total</span>
          <span>₹{priceDetails.total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderPriceDetails;
