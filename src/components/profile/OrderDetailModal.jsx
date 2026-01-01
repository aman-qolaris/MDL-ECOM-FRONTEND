import { useEffect, useState } from "react";
import { FaTimes, FaMapMarkerAlt, FaCreditCard, FaBox } from "react-icons/fa";
import { getProductById } from "../../services/productService"; // ✅ Import this!

const OrderDetailModal = ({ order, onClose }) => {
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);

  // ✅ NEW: State to hold items WITH their images
  const [enrichedItems, setEnrichedItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // 1. FETCH PRODUCT DETAILS (Images & Names)
  useEffect(() => {
    const fetchDetails = async () => {
      if (!order) return;

      setLoadingItems(true);
      const rawItems = order.OrderItems || order.items || [];

      try {
        // Fetch product info for each item in parallel
        const processedItems = await Promise.all(
          rawItems.map(async (item) => {
            // If we already have the product data, use it
            if (item.Product && item.Product.imageUrl) return item;

            try {
              // Otherwise, fetch it from Product Service
              const productData = await getProductById(item.productId);
              return { ...item, Product: productData }; // Attach details
            } catch (err) {
              return item; // Keep item as is if fetch fails
            }
          })
        );
        setEnrichedItems(processedItems);
      } catch (err) {
        console.error("Failed to load images", err);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchDetails();
  }, [order]);

  // 2. CALCULATE SHIPPING (Smart Logic)
  useEffect(() => {
    if (order) {
      const items = order.OrderItems || order.items || [];

      // Calculate Subtotal using historical price
      const calcSubtotal = items.reduce((acc, item) => {
        const price = parseFloat(item.price || item.Product?.price || 0);
        return acc + price * item.quantity;
      }, 0);

      // Shipping = Total Paid - Subtotal
      const orderTotal = parseFloat(order.amount || order.totalAmount || 0);
      let calcShipping = orderTotal - calcSubtotal;

      // Fix tiny math errors
      if (calcShipping < 1 && calcShipping > -1) calcShipping = 0;
      if (calcShipping < 0) calcShipping = 0;

      setSubtotal(calcSubtotal);
      setShipping(calcShipping);
    }
  }, [order]);

  if (!order) return null;

  // Use the 'enrichedItems' if loaded, otherwise fall back to raw items
  const displayItems =
    enrichedItems.length > 0
      ? enrichedItems
      : order.OrderItems || order.items || [];
  const shippingAddress = order.address || order.shippingAddress || {};

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
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
                  order.status === "DELIVERED"
                    ? "bg-green-100 text-green-700"
                    : order.status === "CANCELLED"
                    ? "bg-red-100 text-red-700"
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
              {loadingItems ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Loading details...
                </div>
              ) : displayItems.length > 0 ? (
                displayItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
                  >
                    {/* ✅ IMAGE (Now Works) */}
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
                      {/* ✅ NAME (Now Works) */}
                      <p className="font-semibold text-gray-800">
                        {item.Product?.name || `Product ID: ${item.productId}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        ₹
                        {(
                          (item.price || item.Product?.price || 0) *
                          item.quantity
                        ).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        ₹{item.price || item.Product?.price} each
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-4 text-center text-gray-500">No items found</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-600" /> Shipping Address
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 space-y-1 border border-gray-200 h-full">
                {shippingAddress.fullName ? (
                  <>
                    <p className="font-bold text-gray-900">
                      {shippingAddress.fullName}
                    </p>
                    <p>{shippingAddress.addressLine1}</p>
                    <p>
                      {shippingAddress.city}, {shippingAddress.state}{" "}
                      {shippingAddress.zipCode}
                    </p>
                    <p className="mt-2 text-gray-500">
                      📞 {shippingAddress.phone}
                    </p>
                  </>
                ) : (
                  <p className="italic text-gray-400">Address not available</p>
                )}
              </div>
            </div>

            {/* Payment Summary */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FaCreditCard className="text-blue-600" /> Payment Info
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-3 border border-gray-200 h-full">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {order.paymentMethod || "Card"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  {shipping === 0 ? (
                    <span className="font-medium text-green-600">Free</span>
                  ) : (
                    <span className="font-medium text-gray-900">
                      ₹{shipping.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-1">
                  <span className="font-bold text-gray-800">Total Paid</span>
                  <span className="font-bold text-blue-600 text-lg">
                    ₹{(order.amount || order.totalAmount || 0).toLocaleString()}
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
