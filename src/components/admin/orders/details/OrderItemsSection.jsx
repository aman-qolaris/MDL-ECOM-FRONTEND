/* eslint-disable react/prop-types */
import {
  FaBox,
  FaCheckCircle,
  FaBan,
  FaStore,
  FaWarehouse,
  FaMotorcycle,
  FaClock,
} from "react-icons/fa";

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
        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            order.status === "PACKED"
              ? "bg-orange-100 text-orange-700"
              : order.status === "OUT_FOR_DELIVERY"
              ? "bg-blue-100 text-blue-700"
              : order.status === "DELIVERED"
              ? "bg-green-100 text-green-700"
              : order.status === "PARTIALLY_CANCELLED"
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {order.status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="p-6 space-y-4">
        {order.OrderItems.map((item, idx) => {
          const product = products[item.productId];
          const isStockLow = product && product.warehouseStock < item.quantity;
          const isItemCancelled = item.status === "CANCELLED";

          return (
            <div
              key={idx}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border transition ${
                item.status === "PACKED"
                  ? "bg-green-50 border-green-200"
                  : isItemCancelled
                  ? "bg-red-50 border-red-200 opacity-75"
                  : "bg-white border-gray-200"
              }`}
            >
              {/* PRODUCT INFO */}
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                  {product?.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt="Product"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-gray-400">IMG</span>
                  )}
                </div>
                <div>
                  <p
                    className={`font-bold text-sm ${
                      isItemCancelled
                        ? "text-red-800 line-through"
                        : "text-gray-800"
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
                          {getVendorShopName(item.vendorId)}
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

                {/* BUTTON Logic */}
                <button
                  onClick={() => onToggleItemReady(idx)}
                  //  Disable if item is cancelled OR already packed OR order not in packing state
                  disabled={
                    !isPackingAllowed ||
                    isItemCancelled ||
                    item.status === "PACKED"
                  }
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    item.status === "PACKED"
                      ? "bg-green-100 text-green-700 cursor-not-allowed"
                      : isItemCancelled
                      ? "bg-transparent text-red-500 cursor-not-allowed border border-red-200"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                  } ${
                    !isPackingAllowed ||
                    isItemCancelled ||
                    item.status === "PACKED"
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {item.status === "PACKED" ? (
                    <>
                      <FaCheckCircle /> Packed
                    </>
                  ) : isItemCancelled ? (
                    <>
                      <FaBan /> Cancelled
                    </>
                  ) : (
                    "Mark Packed"
                  )}
                </button>
              </div>
            </div>
          );
        })}
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

        {/* Show "Complete Packing" if status is PROCESSING or PARTIALLY_CANCELLED */}
        {isPackingAllowed && (
          <button
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

        {/* Informative Messages for subsequent stages */}
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
