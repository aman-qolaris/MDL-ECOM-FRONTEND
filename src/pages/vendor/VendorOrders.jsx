import { useEffect, useState } from "react";
import { getVendorOrders } from "../../services/orderService";
import { FaBox } from "react-icons/fa";

const VendorOrders = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-6">Loading your orders...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Orders</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No orders found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
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
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  {/* Order ID */}
                  <td className="py-3 px-6 font-mono font-bold text-gray-500">
                    #{item.orderId}
                  </td>

                  {/* Product Name & ID */}
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
                      </div>
                    </div>
                  </td>

                  {/* Unit Price */}
                  <td className="py-3 px-6 text-right">
                    ₹{item.price?.toLocaleString()}
                  </td>

                  {/* Quantity */}
                  <td className="py-3 px-6 text-center font-bold">
                    {item.quantity}
                  </td>

                  {/* Total Price */}
                  <td className="py-3 px-6 text-right font-bold text-gray-800">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-6 text-center">
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
