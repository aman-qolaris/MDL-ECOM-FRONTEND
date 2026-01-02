import { useEffect, useState } from "react";
import { FaTimes, FaMapMarkerAlt, FaCreditCard, FaBox } from "react-icons/fa";
import { getProductById } from "../../services/productService"; // 1. Import Product Service

const OrderDetailModal = ({ order, onClose }) => {
  const [enrichedItems, setEnrichedItems] = useState([]); // 2. State to hold items with images
  const [loadingItems, setLoadingItems] = useState(true);

  // 3. Effect: Fetch Product Details for every item in the order
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!order) return;

      const rawItems = order.OrderItems || order.items || [];
      setLoadingItems(true);

      try {
        // Fetch details for all items in parallel
        const itemPromises = rawItems.map(async (item) => {
          // Only fetch if we don't already have the Product object
          if (!item.Product || !item.Product.imageUrl) {
            try {
              const productData = await getProductById(item.productId);
              // Merge the fetched product data (name, imageUrl) into the item
              return {
                ...item,
                Product: productData,
              };
            } catch (error) {
              console.error(`Failed to fetch product ${item.productId}`, error);
              return item; // Return item without details on error
            }
          }
          return item; // Item already has details
        });

        const completedItems = await Promise.all(itemPromises);
        setEnrichedItems(completedItems);
      } catch (error) {
        console.error("Error enriching order items:", error);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchProductDetails();
  }, [order]);

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 transition-opacity duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150 relative z-[10000]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
            <p className="text-sm text-gray-500 font-mono">#{order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition p-2 rounded-full hover:bg-red-50"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Bar */}
          <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">
                Order Date
              </p>
              <p className="text-gray-800 font-medium">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString()
                  : new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                Status
              </p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  order.status === "Delivered"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {order.status || "Processing"}
              </span>
            </div>
          </div>

          {/* Items List */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FaBox className="text-blue-600" /> Items Ordered
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* 4. Use enrichedItems instead of raw order.OrderItems */}
              {loadingItems ? (
                <div className="p-4 text-center text-gray-500">
                  Loading item details...
                </div>
              ) : (
                enrichedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
                  >
                    {/* Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {item.Product?.imageUrl ? (
                        <img
                          src={item.Product.imageUrl}
                          alt=""
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      ) : (
                        <FaBox className="text-gray-300 text-2xl" />
                      )}
                    </div>

                    <div className="flex-1">
                      {/* Name */}
                      <p className="font-semibold text-gray-800">
                        {item.Product?.name || `Product ID: ${item.productId}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        ₹{item.price} each
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-600" /> Shipping Address
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 space-y-1 border border-gray-200">
                {order.address ? (
                  <>
                    <p className="font-bold text-gray-900">
                      {order.address.fullName}
                    </p>
                    <p>{order.address.addressLine1}</p>
                    <p>
                      {order.address.city}, {order.address.state}{" "}
                      {order.address.zipCode}
                    </p>
                    <p className="mt-2 text-gray-500">
                      📞 {order.address.phone}
                    </p>
                  </>
                ) : (
                  <p className="italic text-gray-400">Address not available</p>
                )}
              </div>
            </div>

            {/* Payment */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FaCreditCard className="text-blue-600" /> Payment Info
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-3 border border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {order.paymentMethod || "Card"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    ₹{order.amount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-1">
                  <span className="font-bold text-gray-800">Total Paid</span>
                  <span className="font-bold text-blue-600 text-lg">
                    ₹{order.amount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 text-right rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
