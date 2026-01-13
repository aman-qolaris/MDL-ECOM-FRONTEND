import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FaTimes,
  FaMapMarkerAlt,
  FaCreditCard,
  FaBox,
  FaRedo,
  FaUndo,
} from "react-icons/fa";
import { getProductById } from "../../services/productService";
import { addItemToCart } from "../../store/thunks/cartThunks";
import {
  cancelOrder,
  cancelOrderItem,
  getOrderById,
  requestReturn, // ✅ Import this
} from "../../services/orderService";

import { createPortal } from "react-dom";
import ReturnRequestModal from "./ReturnRequestModal";

const OrderDetailModal = ({ order: initialOrder, onClose }) => {
  const [order, setOrder] = useState(initialOrder);
  const [enrichedItems, setEnrichedItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedReturnItem, setSelectedReturnItem] = useState(null);
  const [returningOrder, setReturningOrder] = useState(false); // ✅ Loading state for Return Order

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Status Logic
  const isOrderActive =
    order?.status === "PROCESSING" ||
    order?.status === "PENDING" ||
    order?.status === "PARTIALLY_CANCELLED";

  // Fetch fresh order data
  useEffect(() => {
    if (!initialOrder?.id) return;
    const fetchFreshOrder = async () => {
      try {
        const freshData = await getOrderById(initialOrder.id);
        setOrder(freshData);
      } catch (error) {
        console.error("Failed to fetch fresh order data:", error);
      }
    };
    fetchFreshOrder();
  }, [initialOrder.id]);

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!order) return;
      const rawItems = order.OrderItems || order.items || [];
      setLoadingItems(true);

      try {
        const itemPromises = rawItems.map(async (item) => {
          // ✅ FIX: Check both 'imageUrl' AND the new 'images' array
          if (
            !item.Product ||
            (!item.Product.imageUrl &&
              (!item.Product.images || item.Product.images.length === 0))
          ) {
            try {
              const productData = await getProductById(item.productId);
              return { ...item, Product: productData };
            } catch (error) {
              console.error(`Failed to fetch product ${item.productId}`, error);
              return item;
            }
          }
          return item;
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

  // Helper: Check if item is returnable (48 hours policy)
  const isReturnable = (item) => {
    if (item.status !== "DELIVERED") return false;
    if (item.returnStatus !== "NONE") return false;

    const deliveryDate = new Date(item.updatedAt);
    const now = new Date();
    const diffTime = Math.abs(now - deliveryDate);
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    return diffHours <= 48;
  };

  // ✅ Helper: Check if ANY item in the order is returnable
  const canReturnOrder = enrichedItems.some((item) => isReturnable(item));

  // ✅ HANDLER: Return Entire Order
  const handleReturnOrder = async () => {
    const returnableItems = enrichedItems.filter(isReturnable);

    if (returnableItems.length === 0) {
      alert("No returnable items available in this order.");
      return;
    }

    // Simple prompt for reason (you can replace with a modal if preferred)
    const reason = prompt(
      `Returning ${returnableItems.length} items. Please enter a reason for the return:`
    );

    if (!reason) return; // User cancelled

    if (
      !window.confirm(
        `Are you sure you want to return ${returnableItems.length} items?`
      )
    )
      return;

    try {
      setReturningOrder(true);
      // Loop through all returnable items and send request
      await Promise.all(
        returnableItems.map((item) =>
          requestReturn(order.id, item.id, { reason })
        )
      );

      alert("Return request submitted for all eligible items.");

      // Refresh Order Data
      const freshData = await getOrderById(order.id);
      setOrder(freshData);
    } catch (err) {
      console.error(err);
      alert("Failed to submit return request. Please try again.");
    } finally {
      setReturningOrder(false);
    }
  };

  const handleOrderAgain = async () => {
    setAddingToCart(true);
    try {
      const addPromises = enrichedItems.map((item) =>
        dispatch(
          addItemToCart({ productId: item.productId, quantity: item.quantity })
        ).unwrap()
      );
      await Promise.all(addPromises);
      onClose();
      navigate("/checkout");
    } catch (error) {
      console.error("Failed to add items to cart:", error);
      alert("Some items could not be added (possibly out of stock).");
      navigate("/cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleCancelItem = async (itemId) => {
    if (window.confirm("Are you sure you want to cancel this specific item?")) {
      try {
        await cancelOrderItem(order.id, itemId);
        alert("Item Cancelled Successfully");
        const updatedOrder = await getOrderById(order.id);
        setOrder(updatedOrder);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to cancel item");
      }
    }
  };

  const handleCancelOrder = async () => {
    if (window.confirm("Are you sure you want to cancel the ENTIRE order?")) {
      try {
        await cancelOrder(order.id);
        alert("Order Cancelled Successfully");
        onClose();
        window.location.reload();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to cancel order");
      }
    }
  };

  if (!order) return null;

  return createPortal(
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
                <div className="p-4 text-center text-gray-500">
                  Loading item details...
                </div>
              ) : (
                enrichedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition items-center"
                  >
                    {/* Image Display Fix */}
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {item.Product?.images?.length > 0 ||
                      item.Product?.imageUrl ? (
                        <img
                          src={
                            item.Product?.images?.[0] || item.Product?.imageUrl
                          }
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
                    </div>

                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="font-bold text-gray-800">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>

                      {/* Cancel Item Button */}
                      {isOrderActive &&
                        item.status !== "CANCELLED" &&
                        item.status !== "PACKED" && (
                          <button
                            onClick={() => handleCancelItem(item.id)}
                            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded border border-red-200 transition"
                          >
                            Cancel Item
                          </button>
                        )}

                      {/* Return Item Button */}
                      {isReturnable(item) ? (
                        <button
                          onClick={() => setSelectedReturnItem(item)}
                          className="text-xs px-3 py-1 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-gray-700 transition"
                        >
                          Return Item
                        </button>
                      ) : (
                        item.returnStatus &&
                        item.returnStatus !== "NONE" && (
                          <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-bold border border-orange-200">
                            RETURN: {item.returnStatus}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Address & Payment Info (Kept same) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-600" /> Shipping Address
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 space-y-1 border border-gray-200">
                {order.address ? (
                  <>
                    <p className="font-bold text-gray-900">
                      {order.address?.fullName}
                    </p>
                    <p>{order.address?.addressLine1}</p>
                    <p>
                      {order.address?.city}, {order.address?.state}
                    </p>
                    <p className="mt-2 text-gray-500">
                      📞 {order.address?.phone}
                    </p>
                  </>
                ) : (
                  <p className="italic text-gray-400">Address not available</p>
                )}
              </div>
            </div>

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

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-wrap justify-between items-center rounded-b-xl gap-2">
          <div className="flex flex-wrap gap-3">
            {/* Order Again */}
            <button
              onClick={handleOrderAgain}
              disabled={addingToCart}
              className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:bg-blue-400"
            >
              {addingToCart ? (
                "Adding..."
              ) : (
                <>
                  <FaRedo /> Order Again
                </>
              )}
            </button>

            {/* Cancel Order */}
            {isOrderActive && (
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 text-red-600 font-bold hover:bg-red-100 rounded-lg transition flex items-center gap-2"
              >
                Cancel Order
              </button>
            )}

            {/* ✅ RETURN ORDER BUTTON (New) */}
            {canReturnOrder && (
              <button
                onClick={handleReturnOrder}
                disabled={returningOrder}
                className="px-4 py-2 bg-orange-100 text-orange-700 font-bold border border-orange-200 rounded-lg hover:bg-orange-200 transition flex items-center gap-2 disabled:opacity-50"
              >
                {returningOrder ? (
                  "Processing..."
                ) : (
                  <>
                    <FaUndo /> Return Order
                  </>
                )}
              </button>
            )}

            {/* Return Modal (Single Item) */}
            {selectedReturnItem && (
              <ReturnRequestModal
                orderId={order.id}
                item={selectedReturnItem}
                onClose={() => setSelectedReturnItem(null)}
                onSuccess={async () => {
                  try {
                    const freshData = await getOrderById(order.id);
                    setOrder(freshData);
                  } catch (err) {
                    console.error("Failed to refresh order", err);
                  }
                }}
              />
            )}
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OrderDetailModal;
