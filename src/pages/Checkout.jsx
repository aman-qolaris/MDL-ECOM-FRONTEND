import { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { clearCartThunk } from "../store/thunks/cartThunks";
import { selectCartItems } from "../store/slices/cartSlice";
import { initiatePayment } from "../services/paymentService";
// 🟢 UPDATED: Import the new helper function
import { createOrder, getShippingRateForArea } from "../services/orderService";
import { getWalletBalance } from "../services/walletService";

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
  const [walletBalance, setWalletBalance] = useState(0);

  // 🟢 UPDATED: Add State for dynamic shipping rate
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

  // Fetch Wallet Balance on Mount
  useEffect(() => {
    const loadWallet = async () => {
      try {
        const data = await getWalletBalance();
        setWalletBalance(data.balance || 0);
      } catch (err) {
        console.error("Failed to load wallet", err);
      }
    };
    if (user) loadWallet();
  }, [user]);

  // 🟢 UPDATED: New Effect to Fetch Shipping Rate when Address Changes
  useEffect(() => {
    const fetchShipping = async () => {
      let area = "";

      // Case 1: User selected a saved address from the list
      if (selectedAddressId) {
        const addr = savedAddresses.find((a) => a.id === selectedAddressId);
        if (addr) area = addr.area;
      }
      // Case 2: User entered a new address manually
      else if (shippingAddress?.area) {
        area = shippingAddress.area;
      }

      // If we have an area, ask backend for the rate
      if (area) {
        const rate = await getShippingRateForArea(area);
        setShippingRate(rate);
      } else {
        setShippingRate(0); // Reset if no area selected
      }
    };

    fetchShipping();
  }, [selectedAddressId, shippingAddress, savedAddresses]);

  // 🟢 UPDATED: Calculate Totals using dynamic 'shippingRate'
  const { subtotal, shippingCost, total, walletUsed, payableAmount } =
    useMemo(() => {
      const sub = items.reduce((acc, item) => {
        const product = item.Product || item.product || {};
        const price = product.price || item.price || 0;
        return acc + price * item.quantity;
      }, 0);

      // 🟢 UPDATED: Use the state value instead of hardcoded logic
      const ship = shippingRate;

      const grandTotal = sub + ship;

      const used = Math.min(grandTotal, walletBalance);
      const toPay = grandTotal - used;

      return {
        subtotal: sub,
        shippingCost: ship,
        total: grandTotal,
        walletUsed: used,
        payableAmount: toPay,
      };
    }, [items, walletBalance, shippingRate]); // 🟢 Added shippingRate dependency

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

// 🟢 FIX START: Ensure Name and Phone are always present in the address
      // If shippingAddress (saved address) lacks name/phone, fallback to logged-in user details
      const finalShippingAddress = {
        ...shippingAddress,
        fullName: shippingAddress?.fullName || user?.name,
        phone: shippingAddress?.phone || user?.phone,
      };
      // 🟢 FIX END

      const payload = {
        userId: user?.id,
        items: items.map((item) => ({
          productId: item.productId,
          vendorId: item.Product?.vendorId || item.vendorId || null,
          quantity: item.quantity,
          price: item.Product?.price || item.price,
        })),
        // 🟢 UPDATED: Send 'subtotal' (Item Total) instead of 'total'.
        // The backend logic you shared adds 'shippingCharge' to this amount.
        // If we sent 'total', the customer would be charged shipping twice.
        amount: subtotal,
        address: finalShippingAddress
      };

      // --- 1. FULL WALLET PAYMENT ---
      if (payableAmount === 0) {
        const orderPayload = {
          ...payload,
          paymentMethod: "WALLET",
          payment: true,
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

      // --- 2. PARTIAL / NORMAL PAYMENT ---
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
            walletUsed={walletUsed}
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
            walletUsed={walletUsed}
            payableAmount={payableAmount}
          />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
