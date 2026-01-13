/* eslint-disable react/prop-types */
import {
  FaUndo,
  FaBoxOpen,
  FaCalendarAlt,
  FaPhone,
  FaRupeeSign,
  FaMapMarkerAlt,
  FaWarehouse,
  FaCheckCircle,
} from "react-icons/fa";

const DeliveryTaskCard = ({ task, activeTab, onStatusUpdate }) => {
  const isReturn = task.type === "RETURN_PICKUP";
  const address = task.address || {};
  const items = task.items || [];

  // Map Link
  const mapQuery = `${address.addressLine1}, ${address.city}, ${address.state}`;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    mapQuery
  )}`;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border overflow-hidden relative ${
        isReturn
          ? "border-l-4 border-l-red-500"
          : "border-l-4 border-l-green-500"
      }`}
    >
      {/* Badge Type */}
      <div className="absolute top-3 right-3">
        {isReturn ? (
          <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-red-200">
            <FaUndo /> Return Pickup
          </span>
        ) : (
          <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-green-200">
            <FaBoxOpen /> Delivery
          </span>
        )}
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2 text-gray-400 text-xs font-mono mb-2">
          <span>#{task.orderId}</span>
          <span>•</span>
          <FaCalendarAlt />{" "}
          {new Date(task.createdAt || task.updatedAt).toLocaleDateString()}
        </div>

        {/* Customer & Cash */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">
              {task.customerName || address.fullName}
            </h3>
            <a
              href={`tel:${task.phone || address.phone}`}
              className="text-blue-600 text-sm flex items-center gap-1 font-medium hover:underline"
            >
              <FaPhone size={12} /> {task.phone || address.phone}
            </a>
          </div>

          <div className="text-right">
            {isReturn ? (
              <span className="text-xs font-bold text-gray-400 uppercase">
                Do Not Pay
              </span>
            ) : task.cashToCollect > 0 ? (
              <div className="text-orange-600 font-bold flex flex-col items-end">
                <span className="text-xs text-gray-500 font-normal">
                  Collect Cash
                </span>
                <span className="text-lg flex items-center">
                  <FaRupeeSign size={14} /> {task.cashToCollect}
                </span>
              </div>
            ) : (
              <span className="text-green-600 text-xs font-bold uppercase border border-green-200 px-2 py-1 rounded bg-green-50">
                Prepaid
              </span>
            )}
          </div>
        </div>

        {/* Address & Map */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600 w-3/4">
            <p className="line-clamp-2">
              {address.addressLine1}, {address.area}, {address.city}
            </p>
          </div>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200 transition"
          >
            <FaMapMarkerAlt />
          </a>
        </div>

        {/* Items List (Important for verifying Returns) */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 uppercase font-bold mb-1">
            Items to {isReturn ? "Verify & Pick" : "Deliver"}
          </p>
          <div className="space-y-1">
            {items.length > 0 ? (
              items.map((item, idx) => (
                <div
                  key={idx}
                  className="text-sm text-gray-700 flex justify-between border-b border-gray-100 pb-1 last:border-0"
                >
                  <span>
                    {item.Product?.name || "Product"}{" "}
                    <span className="text-gray-400">x{item.quantity}</span>
                  </span>
                  {isReturn && (
                    <span className="text-xs text-red-500 italic">
                      ({item.returnReason})
                    </span>
                  )}
                </div>
              ))
            ) : (
              <span className="text-xs text-gray-400 italic">
                Item details not available
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        {activeTab === "active" && (
          <div className="grid grid-cols-1 gap-2">
            {/* 1. Pick Up Phase */}
            {(task.status === "ASSIGNED" ||
              task.assignmentStatus === "ASSIGNED") && (
              <button
                onClick={() =>
                  onStatusUpdate(task.assignmentId || task.id, "PICKED")
                }
                className={`w-full py-3 rounded-lg font-bold text-white shadow-md flex justify-center items-center gap-2 transition-transform active:scale-95 ${
                  isReturn
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isReturn ? (
                  <>
                    <FaBoxOpen /> Pick from Customer
                  </>
                ) : (
                  <>
                    <FaBoxOpen /> Pick from Seller/Warehouse
                  </>
                )}
              </button>
            )}

            {/* 2. Delivery Phase */}
            {(task.status === "PICKED" ||
              task.assignmentStatus === "PICKED" ||
              task.status === "OUT_FOR_DELIVERY") && (
              <button
                onClick={() =>
                  onStatusUpdate(task.assignmentId || task.id, "DELIVERED")
                }
                className={`w-full py-3 rounded-lg font-bold text-white shadow-md flex justify-center items-center gap-2 transition-transform active:scale-95 ${
                  isReturn
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isReturn ? (
                  <>
                    <FaWarehouse /> Drop at Warehouse
                  </>
                ) : (
                  <>
                    <FaCheckCircle /> Deliver to Customer
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryTaskCard;
