/* eslint-disable react/prop-types */
import {
  FaBox,
  FaCheckCircle,
  FaBan,
  FaStore,
  FaWarehouse,
  FaMotorcycle,
  FaClock,
  FaUndo,
} from "react-icons/fa";

const getStatusBadgeStyle = (status) => {
  switch (status) {
    case "PACKED":
      return "bg-orange-100 text-orange-700";
    case "OUT_FOR_DELIVERY":
      return "bg-blue-100 text-blue-700";
    case "DELIVERED":
      return "bg-green-100 text-green-700";
    case "PARTIALLY_CANCELLED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getReturnStatusBadgeStyle = (status) => {
  switch (status) {
    case "APPROVED":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "RETURNED":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "REFUNDED":
      return "bg-green-100 text-green-700 border-green-200";
    default:
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }
};

const renderActionButton = (
  item,
  isPackingAllowed,
  isItemCancelled,
  onToggleItemReady,
  idx,
) => {
  const isPacked = item.status === "PACKED";
  const isDisabled = !isPackingAllowed || isItemCancelled || isPacked;

  // Build dynamic classes
  let baseClasses =
    "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ";
  if (isPacked) {
    baseClasses += "bg-green-100 text-green-700 cursor-not-allowed ";
  } else if (isItemCancelled) {
    baseClasses +=
      "bg-transparent text-red-500 cursor-not-allowed border border-red-200 ";
  } else {
    baseClasses += "bg-blue-600 text-white hover:bg-blue-700 shadow-sm ";
  }
  if (isDisabled) {
    baseClasses += "opacity-60 cursor-not-allowed";
  }

  // Determine button content
  let buttonContent;
  if (isPacked) {
    buttonContent = (
      <>
        <FaCheckCircle /> Packed
      </>
    );
  } else if (isItemCancelled) {
    buttonContent = (
      <>
        <FaBan /> Cancelled
      </>
    );
  } else {
    buttonContent = "Mark Packed";
  }

  return (
    <button
      type="button"
      onClick={() => onToggleItemReady(idx)}
      disabled={isDisabled}
      className={baseClasses}
    >
      {buttonContent}
    </button>
  );
};

const OrderItemCard = ({
  item,
  product,
  vendorName,
  idx,
  onToggleItemReady,
  isPackingAllowed,
}) => {
  const isStockLow = product && product.warehouseStock < item.quantity;
  const isItemCancelled = item.status === "CANCELLED";
  const hasReturn = item.returnStatus && item.returnStatus !== "NONE";

  return (
    <div
      className={`flex flex-col p-4 rounded-lg border transition ${
        hasReturn
          ? "bg-orange-50/40 border-orange-200"
          : item.status === "PACKED"
            ? "bg-green-50 border-green-200"
            : isItemCancelled
              ? "bg-red-50 border-red-200 opacity-75"
              : "bg-white border-gray-200"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full">
        {/* PRODUCT INFO */}
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
            {product?.images?.length > 0 || product?.imageUrl ? (
              <img
                src={product?.images?.[0] || product?.imageUrl}
                alt="Product"
                className="w-full h-full object-cover mix-blend-multiply"
              />
            ) : (
              <span className="text-xs font-bold text-gray-400">IMG</span>
            )}
          </div>
          <div>
            <p
              className={`font-bold text-sm ${
                isItemCancelled ? "text-red-800 line-through" : "text-gray-800"
              }`}
            >
              {product?.name || `Product ID: ${item.productId}`}
            </p>

            {isItemCancelled && (
              <span className="text-xs font-bold text-red-600 flex items-center gap-1 mt-1">
                <FaBan size={10} /> ITEM CANCELLED
              </span>
            )}

            {!isItemCancelled && (
              <>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <FaStore className="text-gray-400" />
                  Source:{" "}
                  <span className="font-semibold text-blue-600">
                    {vendorName}
                  </span>
                </p>
                <div className="flex gap-3 mt-2 text-xs">
                  <div
                    className={`flex items-center gap-1 border px-2 py-0.5 rounded ${
                      isStockLow
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-gray-50 text-gray-600"
                    }`}
                  >
                    <FaWarehouse /> Stock:{" "}
                    <strong>{product?.warehouseStock ?? "-"}</strong>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <p className="font-bold text-gray-800">₹{item.price}</p>
            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
          </div>

          {!hasReturn &&
            renderActionButton(
              item,
              isPackingAllowed,
              isItemCancelled,
              onToggleItemReady,
              idx,
            )}
        </div>
      </div>

      {/* RETURN DETAILS BLOCK */}
      {hasReturn && (
        <div className="mt-4 pt-3 border-t border-orange-200 w-full">
          <div className="bg-white/60 p-3 rounded-lg flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-wide shrink-0">
              <FaUndo /> Return Requested
            </div>

            <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>

            <div className="flex-1 text-sm">
              <span className="text-gray-500 mr-1">Reason:</span>
              <span className="font-medium text-gray-800 italic">
                "{item.returnReason}"
              </span>
            </div>

            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${getReturnStatusBadgeStyle(
                item.returnStatus,
              )}`}
            >
              {item.returnStatus.replaceAll("_", " ")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const OrderItemsSection = ({
  order,
  products,
  vendors,
  onToggleItemReady,
  onMarkPacked,
  isPackingAllowed,
  areAllItemsReady,
}) => {
  const getVendorShopName = (vendorId) => {
    if (!vendorId) return "Admin Store";
    const vendor = vendors.find((v) => v.id === vendorId);
    return vendor ? vendor.businessName : `Vendor #${vendorId}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-bold text-gray-700 flex items-center gap-2">
          <FaBox className="text-blue-500" /> Order Items & Packing
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeStyle(
            order.status,
          )}`}
        >
          {order.status.replaceAll("_", " ")}
        </span>
      </div>

      <div className="p-6 space-y-4">
        {order.OrderItems.map((item, idx) => (
          <OrderItemCard
            key={item.id}
            item={item}
            product={products[item.productId]}
            vendorName={getVendorShopName(item.vendorId)}
            idx={idx}
            onToggleItemReady={onToggleItemReady}
            isPackingAllowed={isPackingAllowed}
          />
        ))}
      </div>

      {/* ACTION FOOTER */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm text-gray-500 font-medium">
          {isPackingAllowed ? (
            <span>Action Required: Pack remaining valid items to proceed.</span>
          ) : (
            <span className="flex items-center gap-2 text-blue-600">
              <FaMotorcycle /> Logistics handled by Delivery Partner
            </span>
          )}
        </div>

        {isPackingAllowed && (
          <button
            type="button"
            onClick={onMarkPacked}
            disabled={!areAllItemsReady}
            className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition shadow-md ${
              areAllItemsReady
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <FaBox />
            {areAllItemsReady
              ? "Complete Packing & Assign"
              : "Pack Remaining Items"}
          </button>
        )}

        {order.status === "PACKED" && (
          <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded border border-orange-200 text-sm font-bold">
            <FaClock /> Waiting for Pickup
          </div>
        )}
        {order.status === "OUT_FOR_DELIVERY" && (
          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded border border-blue-200 text-sm font-bold">
            <FaMotorcycle /> Currently Out for Delivery
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderItemsSection;
