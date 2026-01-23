import { FaBox } from "react-icons/fa";

const OrderItemsList = ({
  enrichedItems,
  loadingItems,
  isOrderActive,
  isReturnable,
  onCancelItem,
  onSelectReturnItem,
}) => {
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
          enrichedItems.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition items-center"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-md shrink-0 overflow-hidden flex items-center justify-center">
                {item.Product?.images?.length > 0 || item.Product?.imageUrl ? (
                  <img
                    src={item.Product?.images?.[0] || item.Product?.imageUrl}
                    alt={item.Product?.name || "Product"}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                ) : (
                  <FaBox className="text-gray-300 text-2xl" />
                )}
              </div>

              <div className="flex-1">
                <p className="font-semibold text-gray-800">
                  {item.Product?.name || `Product ID: ${item.productId}`}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
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
              </div>

              <div className="text-right flex flex-col items-end gap-2">
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

                {isReturnable(item) ? (
                  <button
                    onClick={() => onSelectReturnItem(item)}
                    className="text-xs px-3 py-1 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-gray-700 transition"
                  >
                    Return Item
                  </button>
                ) : (
                  item.refundStatus &&
                  item.refundStatus !== "NONE" && (
                    <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-bold border border-orange-200">
                      RETURN: {item.refundStatus}
                    </span>
                  )
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderItemsList;
