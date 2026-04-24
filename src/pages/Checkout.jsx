import { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { clearCartThunk } from "../store/thunks/cartThunks";
import { selectCartItems } from "../store/slices/cartSlice";
import { initiatePayment } from "../services/paymentService";
import { createOrder, getShippingRateForArea } from "../services/orderService";

import CheckoutOrderSummary from "./checkout/CheckoutOrderSummary";
import CheckoutPaymentStep from "./checkout/CheckoutPaymentStep";
import CheckoutShippingStep from "./checkout/CheckoutShippingStep";
import { useCheckoutInitialization } from "./checkout/useCheckoutInitialization";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const items = useSelector(selectCartItems);
  const { user } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shippingRate, setShippingRate] = useState(0);

  const {
    isInitializing,
    savedAddresses,
    selectedAddressId,
    showNewAddressForm,
    setSelectedAddressId,
    setShowNewAddressForm,
  } = useCheckoutInitialization({ user, dispatch });

  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  // 🟢 Fetch Shipping Rate when Address Changes
  useEffect(() => {
    const fetchShipping = async () => {
      let area = "";

      if (selectedAddressId) {
        const addr = savedAddresses.find((a) => a.id === selectedAddressId);
        if (addr) area = addr.area;
      } else if (shippingAddress?.area) {
        area = shippingAddress.area;
      }

      if (area) {
        const rate = await getShippingRateForArea(area);
        setShippingRate(rate);
      } else {
        setShippingRate(0);
      }
    };

    fetchShipping();
  }, [selectedAddressId, shippingAddress, savedAddresses]);

  // 🟢 Calculate Totals (Wallet logic removed to prevent crashes)
  const { subtotal, shippingCost, total, payableAmount } = useMemo(() => {
    const sub = items.reduce((acc, item) => {
      const product = item.Product || item.product || {};
      const price = product.price || item.price || 0;
      return acc + price * item.quantity;
    }, 0);

    const ship = shippingRate;
    const grandTotal = sub + ship;

    return {
      subtotal: sub,
      shippingCost: ship,
      total: grandTotal,
      walletUsed: 0,
      payableAmount: grandTotal,
    };
  }, [items, shippingRate]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (items.length === 0 && !isPaymentSuccess) {
    return <Navigate to="/shop" replace />;
  }

  const handleNewAddressSubmit = (addressData) => {
    setShippingAddress(addressData);
    setStep(2);
  };

  const handleSavedAddressSubmit = () => {
    const selected = savedAddresses.find(
      (addr) => addr.id === selectedAddressId,
    );
    if (selected) {
      setShippingAddress(selected);
      setStep(2);
    }
  };

  const handleOrderSubmit = async (paymentData) => {
    try {
      setLoading(true);

      const finalShippingAddress = {
        ...shippingAddress,
        fullName: shippingAddress?.fullName || user?.name,
        phone: shippingAddress?.phone || user?.phone,
      };

      const payload = {
        userId: user?.id,
        items: items.map((item) => ({
          productId: item.productId,
          vendorId: item.Product?.vendorId || item.vendorId || null,
          quantity: item.quantity,
          price: item.Product?.price || item.price,
        })),
        amount: subtotal,
        address: finalShippingAddress,
      };

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

      if (paymentData.method === "razorpay") {
        const orderPayload = {
          ...payload,
          paymentMethod: "RAZORPAY",
          payment: false,
        };
        const dbOrder = await createOrder(orderPayload);
        const dbOrderId = dbOrder.orderId || dbOrder.id;

        await initiatePayment(
          payableAmount,
          user,
          dbOrderId,
          async (paymentResponse) => {
            setIsPaymentSuccess(true);
            navigate("/order-success", {
              state: {
                orderId: dbOrderId,
                orderDetails: { itemCount: items.length, totalAmount: total },
              },
            });
            dispatch(clearCartThunk());
          },
        );
      }
    } catch (error) {
      console.error("Order Failed:", error);
      alert(
        "Order processing failed: " +
          (error.response?.data?.message || error.message),
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
        <div className="lg:w-2/3 space-y-6">
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

          <CheckoutPaymentStep
            step={step}
            payableAmount={payableAmount}
            walletUsed={0}
            onSubmit={handleOrderSubmit}
            onBack={() => setStep(1)}
          />
        </div>

        <div className="lg:w-1/3">
          <CheckoutOrderSummary
            items={items}
            subtotal={subtotal}
            shippingCost={shippingCost}
            total={total}
            walletUsed={0}
            payableAmount={payableAmount}
          />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
