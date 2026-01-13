/* eslint-disable react/prop-types */
import { FaMoneyBillWave } from "react-icons/fa";

const OrderPaymentInfo = ({ order }) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border p-6 ${
        !order.payment
          ? "border-orange-200 bg-orange-50"
          : "border-green-200 bg-green-50"
      }`}
    >
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <FaMoneyBillWave
          className={order.payment ? "text-green-600" : "text-orange-600"}
        />{" "}
        Payment Information
      </h3>
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-gray-600">Method</span>
        <span className="font-bold text-gray-800">{order.paymentMethod}</span>
      </div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-600">Status</span>
        <span
          className={`px-3 py-1 rounded text-xs font-bold ${
            order.payment
              ? "bg-green-200 text-green-800"
              : "bg-orange-200 text-orange-800"
          }`}
        >
          {order.payment ? "PAID" : "PENDING"}
        </span>
      </div>
      {!order.payment && order.paymentMethod === "COD" && (
        <p className="text-xs text-center text-orange-800 mt-4 border-t border-orange-200 pt-2">
          Payment will be collected by Delivery Partner.
        </p>
      )}
    </div>
  );
};

export default OrderPaymentInfo;
