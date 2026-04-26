/* eslint-disable react/prop-types */
import { FaUserSecret, FaExchangeAlt, FaPhone } from "react-icons/fa";

const getActiveAssignment = (order) => {
  if (!order) return null;

  if (
    Array.isArray(order.DeliveryAssignments) &&
    order.DeliveryAssignments.length > 0
  ) {
    return (
      order.DeliveryAssignments.find(
        (a) => !["FAILED", "REASSIGNED", "CANCELLED"].includes(a.status),
      ) || order.DeliveryAssignments[order.DeliveryAssignments.length - 1]
    );
  }

  return order.DeliveryAssignment;
};

const OrderDeliveryPartner = ({ order, onReassign, isPackingAllowed }) => {
  const assignment = getActiveAssignment(order);
  const deliveryBoy = assignment?.DeliveryBoy;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-gray-700 flex items-center gap-2">
          <FaUserSecret className="text-blue-600" /> Delivery Partner
        </h3>
        {/* Reassign allowed only if not yet delivered */}
        {deliveryBoy &&
          order.status !== "DELIVERED" &&
          order.status !== "CANCELLED" && (
            <button
              onClick={onReassign}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded transition"
            >
              <FaExchangeAlt /> Reassign
            </button>
          )}
      </div>

      {deliveryBoy ? (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
              <FaUserSecret size={24} />
            </div>
            <div>
              <p className="font-bold text-gray-800">{deliveryBoy.name}</p>
              <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                <FaPhone size={12} /> {deliveryBoy.phone}
              </p>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2 border border-gray-100">
            <div className="flex justify-between">
              <span className="text-gray-500">Partner Status:</span>
              <span className="font-semibold text-blue-600">
                {assignment?.status || "ASSIGNED"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="font-medium">No Partner Assigned</p>
          {isPackingAllowed && (
            <p className="text-xs mt-2 text-blue-500">
              Partner will be auto-assigned when you click <br />
              <strong>&quot;Complete Packing&quot;</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderDeliveryPartner;
