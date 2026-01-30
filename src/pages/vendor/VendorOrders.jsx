import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getVendorOrders } from "../../services/orderService";
import { FaArrowLeft, FaBox, FaFilter, FaTimes, FaUndo } from "react-icons/fa";

const VendorOrders = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const filterType = searchParams.get("filter");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getVendorOrders();
      setItems(data);
    } catch (error) {
      console.error("Error fetching vendor orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FILTER LOGIC
  // ... inside VendorOrders component ...

  // ✅ FILTER LOGIC
  const filteredItems = items.filter((item) => {
    // 1. Pending Orders
    if (filterType === "pending") {
      return ["PENDING", "PROCESSING"].includes(item.status);
    }

    // 2. Today's Orders
    if (filterType === "today") {
      const today = new Date().toISOString().split("T")[0];
      return item.createdAt && item.createdAt.startsWith(today);
    }

    // 3. Return Requests (Active Only)
    if (filterType === "returns") {
      return ["REQUESTED", "APPROVED", "PICKUP_SCHEDULED", "RETURNED"].includes(
        item.refundStatus,
      );
    }

    // 🟢 4. NEW: Revenue Filter (Matches Total Sales)
    // Show ONLY items that are Delivered AND Kept (Not Returned/Refunded)
    if (filterType === "revenue") {
      return (
        item.status === "DELIVERED" &&
        (!item.refundStatus ||
          item.refundStatus === "NONE" ||
          // Note: We hide 'REQUESTED' here too if you want strict "Safe Money" view,
          // but typically 'REQUESTED' is still counted until approved.
          // To strictly match "Net Revenue" backend logic, exclude finalized returns:
          !["RETURNED", "CREDITED", "COMPLETED", "CANCELLED"].includes(
            item.refundStatus,
          ))
      );
    }

    // Default: Show all (or whatever your default behavior is)
    return true;
  });

  const clearFilter = () => {
    setSearchParams({});
  };

  if (loading) return <div className="p-6">Loading your orders...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm"
          >
            <FaArrowLeft />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Your Orders</h2>
        </div>

        {filterType && (
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold border border-blue-200">
            <FaFilter />
            <span className="capitalize">
              Showing:{" "}
              {filterType === "today"
                ? "Today's Orders"
                : filterType === "returns"
                  ? "Return Requests"
                  : "Pending Orders"}
            </span>
            <button
              onClick={clearFilter}
              className="ml-2 hover:text-red-500 transition-colors"
              title="Clear Filter"
            >
              <FaTimes />
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {filterType ? `No ${filterType} orders found.` : "No orders found."}
            {filterType && (
              <button
                onClick={clearFilter}
                className="block mx-auto mt-2 text-blue-600 hover:underline"
              >
                View All Orders
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[860px]">
              <thead>
                <tr className="bg-gray-50 text-gray-600 uppercase text-sm">
                  <th className="py-3 px-6">Order Ref</th>
                  <th className="py-3 px-6">Product Details</th>
                  <th className="py-3 px-6 text-right">Price</th>
                  <th className="py-3 px-6 text-center">Qty</th>
                  <th className="py-3 px-6 text-right">Total</th>
                  <th className="py-3 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-6 font-mono font-bold text-gray-500">
                      #{item.orderId}
                    </td>

                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded text-purple-600 shrink-0">
                          <FaBox />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">
                            {item.Product?.name || "Unknown Product"}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            ID: {item.productId}
                          </span>
                          {item.Product?.Category && (
                            <span className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">
                              {item.Product.Category.name}
                            </span>
                          )}

                          {item.returnReason && (
                            <span className="text-[10px] text-red-500 italic mt-1">
                              Reason: "{item.returnReason}"
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-6 text-right">
                      ₹{item.price?.toLocaleString()}
                    </td>

                    <td className="py-3 px-6 text-center font-bold">
                      {item.quantity}
                    </td>

                    <td className="py-3 px-6 text-right font-bold text-gray-800">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </td>

                    <td className="py-3 px-6 text-center">
                      <div className="flex flex-col gap-1 items-center">
                        {/* 🟢 FIX: Use 'refundStatus' here as well */}
                        {item.refundStatus && item.refundStatus !== "NONE" && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 flex items-center gap-1">
                            <FaUndo size={10} /> {item.refundStatus}
                          </span>
                        )}

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            item.status === "PACKED"
                              ? "bg-green-100 text-green-700"
                              : item.status === "CANCELLED"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {item.status || "PENDING"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorOrders;
