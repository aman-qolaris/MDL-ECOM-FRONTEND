import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addItemToCart } from "../../store/thunks/cartThunks";
import {
  cancelOrder,
  cancelOrderItem,
  requestReturn, // ✅ Import this
} from "../../services/orderService";

import { createPortal } from "react-dom";
import OrderAddressPaymentInfo from "./orderDetails/OrderAddressPaymentInfo";
import OrderDetailFooter from "./orderDetails/OrderDetailFooter";
import OrderDetailHeader from "./orderDetails/OrderDetailHeader";
import OrderItemsList from "./orderDetails/OrderItemsList";
import OrderStatusBar from "./orderDetails/OrderStatusBar";
import { useOrderDetails } from "./orderDetails/useOrderDetails";

const OrderDetailModal = ({ order: initialOrder, onClose }) => {
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedReturnItem, setSelectedReturnItem] = useState(null);
  const [returningOrder, setReturningOrder] = useState(false); // ✅ Loading state for Return Order

  const {
    order,
    enrichedItems,
    loadingItems,
    refreshOrder,
    isOrderActive,
    isReturnable,
    canReturnOrder,
  } = useOrderDetails(initialOrder);

  const dispatch = useDispatch();
  const navigate = useNavigate();

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

      await refreshOrder();
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
        await refreshOrder();
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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150 relative">
        <OrderDetailHeader orderId={order.id} onClose={onClose} />

        <div className="p-6 space-y-6">
          <OrderStatusBar order={order} />

          <OrderItemsList
            enrichedItems={enrichedItems}
            loadingItems={loadingItems}
            isOrderActive={isOrderActive}
            isReturnable={isReturnable}
            onCancelItem={handleCancelItem}
            onSelectReturnItem={setSelectedReturnItem}
          />

          <OrderAddressPaymentInfo order={order} />
        </div>

        <OrderDetailFooter
          onOrderAgain={handleOrderAgain}
          addingToCart={addingToCart}
          isOrderActive={isOrderActive}
          onCancelOrder={handleCancelOrder}
          canReturnOrder={canReturnOrder}
          onReturnOrder={handleReturnOrder}
          returningOrder={returningOrder}
          onClose={onClose}
          selectedReturnItem={selectedReturnItem}
          orderId={order.id}
          onReturnItemClose={() => setSelectedReturnItem(null)}
          onReturnItemSuccess={refreshOrder}
        />
      </div>
    </div>,
    document.body
  );
};

export default OrderDetailModal;
