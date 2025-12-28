import { useEffect, useState } from "react";
// 👇 IMPORT THE NEW VENDOR FUNCTIONS
import {
  getVendorOrders,
  updateVendorItemStatus,
} from "../../services/orderService";
import { FaBox, FaCheck } from "react-icons/fa";

const VendorOrders = () => {
  const [items, setItems] = useState([]); // Stores OrderItems
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // 👇 USE THE VENDOR SPECIFIC FUNCTION
      const data = await getVendorOrders();
      setItems(data);
    } catch (error) {
      console.error("Error fetching vendor orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPacked = async (itemId) => {
    try {
      // Optimistic UI Update
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, status: "PACKED" } : item
        )
      );

      // 👇 CALL THE NEW SERVICE FUNCTION
      await updateVendorItemStatus(itemId, "PACKED");
      alert("Item marked as packed!");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update status.");
      fetchOrders(); // Revert on error
    }
  };

  if (loading) return <div className="p-6">Loading your orders...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Orders</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No pending items to fulfill.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-sm">
                <th className="py-3 px-6">Order Ref</th>
                <th className="py-3 px-6">Product Item</th>
                <th className="py-3 px-6">Qty</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {items.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-6 font-mono font-bold">
                    #{item.orderId}
                  </td>

                  <td className="py-3 px-6 flex items-center gap-2">
                    <div className="bg-purple-100 p-2 rounded text-purple-600">
                      <FaBox />
                    </div>
                    {/* Handle case where Product might be null */}
                    <span className="font-medium text-gray-800">
                      {item.Product?.name || `Product ID: ${item.productId}`}
                    </span>
                  </td>

                  <td className="py-3 px-6 font-bold">x {item.quantity}</td>

                  <td className="py-3 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.status === "PACKED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status || "PENDING"}
                    </span>
                  </td>

                  <td className="py-3 px-6">
                    {item.status !== "PACKED" && item.status !== "DELIVERED" ? (
                      <button
                        onClick={() => handleMarkPacked(item.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1 text-xs"
                      >
                        <FaCheck /> Mark Packed
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs italic">
                        No actions
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default VendorOrders;
