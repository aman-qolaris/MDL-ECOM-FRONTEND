import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  addItemToCart,
  getCartItems,
  clearCartThunk,
} from "../../store/thunks/cartThunks";
import {
  cancelOrder,
  cancelOrderItem,
  requestReturn,
} from "../../services/orderService";

import { createPortal } from "react-dom";
import OrderAddressPaymentInfo from "./orderDetails/OrderAddressPaymentInfo";
import OrderDetailFooter from "./orderDetails/OrderDetailFooter";
import OrderDetailHeader from "./orderDetails/OrderDetailHeader";
import OrderItemsList from "./orderDetails/OrderItemsList";
import OrderStatusBar from "./orderDetails/OrderStatusBar";
import { useOrderDetails } from "./orderDetails/useOrderDetails";
import CancelRequestModal from "./CancelRequestModal"; // 🟢 ADD THIS

const OrderDetailModal = ({ order: initialOrder, onClose }) => {
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedReturnItem, setSelectedReturnItem] = useState(null);
  const [returningOrder, setReturningOrder] = useState(false);

  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    type: null, // 'ORDER' or 'ITEM'
    targetId: null,
  });
  const [cancelling, setCancelling] = useState(false);

  const {
    order,
    enrichedItems,
    loadingItems,
    refreshOrder,
    isOrderActive,
    isReturnable,
    canReturnOrder,
  } = useOrderDetails(initialOrder);

  const hasPackedItems = enrichedItems.some((item) => item.status === "PACKED");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleReturnOrder = async () => {
    const returnableItems = enrichedItems.filter(isReturnable);

    if (returnableItems.length === 0) {
      alert("No returnable items available in this order.");
      return;
    }

    // Simple prompt for reason (you can replace with a modal if preferred)
    const reason = prompt(
      `Returning ${returnableItems.length} items. Please enter a reason for the return:`,
    );

    if (!reason) return; // User cancelled

    if (
      !window.confirm(
        `Are you sure you want to return ${returnableItems.length} items?`,
      )
    )
      return;

    try {
      setReturningOrder(true);
      // Loop through all returnable items and send request
      await Promise.all(
        returnableItems.map((item) =>
          requestReturn(order.id, item.id, { reason }),
        ),
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
      await dispatch(clearCartThunk()).unwrap();
      const itemsToOrder = enrichedItems;

      if (!itemsToOrder || itemsToOrder.length === 0) {
        toast.warning("No items available to re-order.");
        setAddingToCart(false);
        return;
      }

      const addPromises = itemsToOrder.map((item) =>
        dispatch(
          addItemToCart({ productId: item.productId, quantity: item.quantity }),
        ).unwrap(),
      );

      await Promise.all(addPromises);
      await dispatch(getCartItems()).unwrap();

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

  const handleCancelItemClick = (itemId) => {
    setCancelModal({
      isOpen: true,
      type: "ITEM",
      targetId: itemId,
    });
  };

  const handleCancelOrderClick = () => {
    setCancelModal({
      isOpen: true,
      type: "ORDER",
      targetId: order.id,
    });
  };

  const handleConfirmCancel = async (reason) => {
    setCancelling(true);
    try {
      if (cancelModal.type === "ORDER") {
        await cancelOrder(order.id, reason);
        toast.success("Order Cancelled Successfully");
        onClose();
        window.location.reload();
      } else if (cancelModal.type === "ITEM") {
        await cancelOrderItem(order.id, cancelModal.targetId, reason);
        toast.success("Item Cancelled Successfully");
        await refreshOrder();
        setCancelModal({ isOpen: false, type: null, targetId: null });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel");
    } finally {
      setCancelling(false);
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
            onCancelItem={handleCancelItemClick}
            onSelectReturnItem={setSelectedReturnItem}
          />

          <OrderAddressPaymentInfo order={order} />
        </div>

        <OrderDetailFooter
          onOrderAgain={handleOrderAgain}
          addingToCart={addingToCart}
          isOrderActive={isOrderActive}
          onCancelOrder={!hasPackedItems ? handleCancelOrderClick : null}
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

      <CancelRequestModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ ...cancelModal, isOpen: false })}
        onSubmit={handleConfirmCancel}
        loading={cancelling}
        title={
          cancelModal.type === "ORDER" ? "Cancel Entire Order" : "Cancel Item"
        }
      />
    </div>,
    document.body,
  );
};

export default OrderDetailModal;
