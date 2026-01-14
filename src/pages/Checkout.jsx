import { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { clearCartThunk } from "../store/thunks/cartThunks";
// 1. Import optimized selector
import { selectCartItems } from "../store/slices/cartSlice";
import { initiatePayment } from "../services/paymentService";
import { createOrder } from "../services/orderService";

import CheckoutOrderSummary from "./checkout/CheckoutOrderSummary";
import CheckoutPaymentStep from "./checkout/CheckoutPaymentStep";
import CheckoutShippingStep from "./checkout/CheckoutShippingStep";
import { useCheckoutInitialization } from "./checkout/useCheckoutInitialization";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 2. Use specific selector for performance
  const items = useSelector(selectCartItems);
  const { user } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    isInitializing,
    savedAddresses,
    selectedAddressId,
    showNewAddressForm,
    setSelectedAddressId,
    setShowNewAddressForm,
  } = useCheckoutInitialization({ user, dispatch });

  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  // 3. OPTIMIZATION: Memoize the calculation.
  // This prevents recalculating the total on every keystroke when user fills the address form.
  const { subtotal, shippingCost, total } = useMemo(() => {
    const sub = items.reduce((acc, item) => {
      // Robust Price Check
      const product = item.Product || item.product || {};
      const price = product.price || item.price || 0;
      return acc + price * item.quantity;
    }, 0);

    const ship = sub > 1000 ? 0 : 50;
    return {
      subtotal: sub,
      shippingCost: ship,
      total: sub + ship,
    };
  }, [items]);

  // LOADING CHECK
  if (isInitializing) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Loading Checkout...
      </div>
    );
  }

  // REDIRECT if empty
  if (items.length === 0 && !isPaymentSuccess) {
    return <Navigate to="/shop" replace />;
  }

  // HANDLERS
  const handleNewAddressSubmit = (addressData) => {
    setShippingAddress(addressData);
    setStep(2);
  };

  const handleSavedAddressSubmit = () => {
    const selected = savedAddresses.find(
      (addr) => addr.id === selectedAddressId
    );
    if (selected) {
      setShippingAddress(selected);
      setStep(2);
    }
  };

  const handleOrderSubmit = async (paymentData) => {
    try {
      setLoading(true);

      const payload = {
        userId: user?.id,
        items: items.map((item) => ({
          productId: item.productId,
          vendorId: item.Product?.vendorId || item.vendorId || null,
          quantity: item.quantity,
          price: item.Product?.price || item.price,
        })),
        amount: total,
        address: shippingAddress,
      };

      // --- 1. COD Flow ---
      if (paymentData.method === "cod") {
        const orderPayload = {
          ...payload,
          paymentMethod: "COD",
          payment: false,
        };
        const response = await createOrder(orderPayload);

        setIsPaymentSuccess(true);
        navigate("/order-success", {
          state: {
            orderId: response.orderId || response.id,
            orderDetails: { itemCount: items.length, totalAmount: total },
          },
        });
        dispatch(clearCartThunk());
        return;
      }

      // --- 2. Razorpay Flow ---
      if (paymentData.method === "razorpay") {
        // A. Create Order in Database FIRST
        const orderPayload = {
          ...payload,
          paymentMethod: "RAZORPAY",
          payment: false,
        };
        const dbOrder = await createOrder(orderPayload);

        // Get the real Order ID from DB response
        const dbOrderId = dbOrder.orderId || dbOrder.id;

        // B. Now Initiate Payment
        await initiatePayment(
          total,
          user,
          dbOrderId,
          async (paymentResponse) => {
            // C. On Success
            setIsPaymentSuccess(true);

            navigate("/order-success", {
              state: {
                orderId: dbOrderId,
                orderDetails: { itemCount: items.length, totalAmount: total },
              },
            });
            dispatch(clearCartThunk());
          }
        );
      }
    } catch (error) {
      console.error("Order Failed:", error);
      alert(
        "Order processing failed: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">
          Processing secure payment...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:w-2/3 space-y-6">
          {/* STEP 1: SHIPPING ADDRESS */}
          <CheckoutShippingStep
            step={step}
            shippingAddress={shippingAddress}
            savedAddresses={savedAddresses}
            selectedAddressId={selectedAddressId}
            showNewAddressForm={showNewAddressForm}
            onEdit={() => setStep(1)}
            onSelectAddressId={setSelectedAddressId}
            onShowNewAddressForm={() => setShowNewAddressForm(true)}
            onBackToSavedAddresses={() => setShowNewAddressForm(false)}
            onSubmitNewAddress={handleNewAddressSubmit}
            onDeliverSavedAddress={handleSavedAddressSubmit}
          />

          {/* STEP 2: PAYMENT */}
          <CheckoutPaymentStep
            step={step}
            onSubmit={handleOrderSubmit}
            onBack={() => setStep(1)}
          />
        </div>

        {/* RIGHT COLUMN: SUMMARY */}
        <div className="lg:w-1/3">
          <CheckoutOrderSummary
            items={items}
            subtotal={subtotal}
            shippingCost={shippingCost}
            total={total}
          />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
