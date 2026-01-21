import { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { clearCartThunk } from "../store/thunks/cartThunks";
import { selectCartItems } from "../store/slices/cartSlice";
import { initiatePayment } from "../services/paymentService";
import { createOrder } from "../services/orderService";
// 🟢 1. Import Wallet Service
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
  const [walletBalance, setWalletBalance] = useState(0); // 🟢 2. Wallet State

  const {
    isInitializing,
    savedAddresses,
    selectedAddressId,
    showNewAddressForm,
    setSelectedAddressId,
    setShowNewAddressForm,
  } = useCheckoutInitialization({ user, dispatch });

  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  // 🟢 3. Fetch Wallet Balance on Mount
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

  // 4. Calculate Totals & Split
  const { subtotal, shippingCost, total, walletUsed, payableAmount } =
    useMemo(() => {
      const sub = items.reduce((acc, item) => {
        const product = item.Product || item.product || {};
        const price = product.price || item.price || 0;
        return acc + price * item.quantity;
      }, 0);

      const ship = sub > 1000 ? 0 : 50;
      const grandTotal = sub + ship;

      // 🟢 Logic: Use Wallet as much as possible
      const used = Math.min(grandTotal, walletBalance);
      const toPay = grandTotal - used;

      return {
        subtotal: sub,
        shippingCost: ship,
        total: grandTotal,
        walletUsed: used, // Amount covered by wallet
        payableAmount: toPay, // Remaining to be paid via COD/Online
      };
    }, [items, walletBalance]);

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

      const payload = {
        userId: user?.id,
        items: items.map((item) => ({
          productId: item.productId,
          vendorId: item.Product?.vendorId || item.vendorId || null,
          quantity: item.quantity,
          price: item.Product?.price || item.price,
        })),
        amount: total, // Backend handles the split logic based on this total
        address: shippingAddress,
      };

      // --- 1. FULL WALLET PAYMENT (Payable is 0) ---
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
      // User pays 'payableAmount' via COD or Razorpay

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

        // Initiate Razorpay for the PAYABLE AMOUNT (not the total)
        await initiatePayment(
          payableAmount, // 🟢 Charge only the remaining amount
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

          {/* 🟢 Pass updated amounts to Payment Step */}
          <CheckoutPaymentStep
            step={step}
            payableAmount={payableAmount}
            walletUsed={walletUsed}
            onSubmit={handleOrderSubmit}
            onBack={() => setStep(1)}
          />
        </div>

        <div className="lg:w-1/3">
          {/* 🟢 Pass Wallet info to Summary */}
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
