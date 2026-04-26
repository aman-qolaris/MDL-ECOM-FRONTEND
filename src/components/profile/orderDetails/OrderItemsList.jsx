import { FaBox, FaInfoCircle } from "react-icons/fa";

const OrderItemsList = ({
  enrichedItems,
  loadingItems,
  isOrderActive,
  isReturnable,
  onCancelItem,
  onSelectReturnItem,
}) => {
  // 🟢 NEW: Map Backend Statuses to User-Friendly Messages & Colors
  const getReturnStatusDisplay = (status) => {
    switch (status) {
      case "REQUESTED":
        return {
          text: "Return Requested (Pending Approval)",
          color: "text-orange-700 bg-orange-100 border-orange-200",
        };
      case "APPROVED":
        return {
          text: "Return Approved (Pending Pickup/Drop)",
          color: "text-blue-700 bg-blue-100 border-blue-200",
        };
      case "PICKUP_SCHEDULED":
        return {
          text: "Pickup Scheduled / In Transit",
          color: "text-purple-700 bg-purple-100 border-purple-200",
        };
      case "RETURNED":
        return {
          text: "Item Received at Warehouse",
          color: "text-indigo-700 bg-indigo-100 border-indigo-200",
        };
      case "COMPLETED":
        return {
          text: "Quality Check Passed",
          color: "text-teal-700 bg-teal-100 border-teal-200",
        };
      case "CREDITED":
        return {
          text: "Refund Processed Successfully",
          color: "text-green-700 bg-green-100 border-green-200",
        };
      case "REJECTED":
        return {
          text: "Return Request Rejected",
          color: "text-red-700 bg-red-100 border-red-200",
        };
      default:
        return {
          text: `Status: ${status}`,
          color: "text-gray-700 bg-gray-100 border-gray-200",
        };
    }
  };

  return (
    <div>
      <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        <FaBox className="text-blue-600" /> Items Ordered
      </h3>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {loadingItems ? (
          <div className="p-4 text-center text-gray-500">
            Loading item details...
          </div>
        ) : (
          enrichedItems.map((item, idx) => {
            const isReturnedItem =
              item.refundStatus &&
              item.refundStatus !== "NONE" &&
              item.status !== "CANCELLED";
            const returnDisplay = isReturnedItem
              ? getReturnStatusDisplay(item.refundStatus)
              : null;

            return (
              <div
                key={idx}
                className="flex gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition items-center flex-wrap sm:flex-nowrap"
              >
                {/* Product Image */}
                <div className="w-16 h-16 bg-gray-100 rounded-md shrink-0 overflow-hidden flex items-center justify-center">
                  {item.Product?.images?.length > 0 ||
                  item.Product?.imageUrl ? (
                    <img
                      src={item.Product?.images || item.Product?.imageUrl}
                      alt={item.Product?.name || "Product"}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  ) : (
                    <FaBox className="text-gray-300 text-2xl" />
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-[200px]">
                  <p className="font-semibold text-gray-800">
                    {item.Product?.name || `Product ID: ${item.productId}`}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                    {item.status === "CANCELLED" && (
                      <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold border border-red-200">
                        CANCELLED
                      </span>
                    )}
                    {item.status === "PACKED" && (
                      <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded font-bold border border-purple-200">
                        PACKED
                      </span>
                    )}
                  </div>

                  {/* 🟢 NEW: Detailed Return Status Tracker under the item name */}
                  {isReturnedItem && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold">
                      <FaInfoCircle
                        className={returnDisplay.color.split(" ")}
                      />
                      <span
                        className={`px-2 py-0.5 rounded border ${returnDisplay.color}`}
                      >
                        {returnDisplay.text}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions & Pricing */}
                <div className="text-right flex flex-col items-end gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <p className="font-bold text-gray-800">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>

                  {isOrderActive &&
                    item.status !== "CANCELLED" &&
                    item.status !== "PACKED" && (
                      <button
                        onClick={() => onCancelItem(item.id)}
                        className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded border border-red-200 transition"
                      >
                        Cancel Item
                      </button>
                    )}

                  {isReturnable(item) && (
                    <button
                      onClick={() => onSelectReturnItem(item)}
                      className="text-xs px-3 py-1 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-gray-700 transition"
                    >
                      Return Item
                    </button>
                  )}

                  {/* Fallback for Cancellations */}
                  {item.status === "CANCELLED" &&
                    item.refundStatus &&
                    item.refundStatus !== "NONE" && (
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold border bg-blue-100 text-blue-700 border-blue-200">
                        REFUND: {item.refundStatus}
                      </span>
                    )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrderItemsList;
