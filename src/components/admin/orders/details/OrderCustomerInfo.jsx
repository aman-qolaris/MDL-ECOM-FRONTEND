/* eslint-disable react/prop-types */

const OrderCustomerInfo = ({ order }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="font-bold text-gray-700 mb-4">Customer Details</h3>
      <div className="text-sm text-gray-600 space-y-1">
        <p className="font-bold text-gray-800 text-base">
          {order.address?.fullName || "Guest"}
        </p>
        <p>{order.address?.addressLine1}</p>
        {order.assignedArea && (
          <p className="font-semibold text-blue-600">
            Area: {order.assignedArea}
          </p>
        )}
        <p>
          {order.address?.city}, {order.address?.state}
        </p>
        <p className="pt-2 font-mono text-gray-500">
          Ph: {order.address?.phone}
        </p>
      </div>
    </div>
  );
};

export default OrderCustomerInfo;
