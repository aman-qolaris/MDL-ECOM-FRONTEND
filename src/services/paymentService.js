import api from "./api";
import { loadRazorpayScript } from "../utils/loadRazorpay";

// 🔴 REPLACE WITH YOUR RAZORPAY TEST KEY ID
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

export const initiatePayment = async (amount, user, orderId, onSuccess) => {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("Razorpay SDK failed to load.");
      return;
    }

    // 1. Create Razorpay Order (Calls your backend)
    const { data } = await api.post("/orders/payment/create", {
      amount: amount,
      orderId: orderId,
    });

    if (!data.success) throw new Error("Failed to create payment order");

    const { razorpayOrder } = data;

    // 2. Configure Razorpay Options
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "My E-Comm Store",
      description: `Order #${orderId}`,
      order_id: razorpayOrder.id, // Razorpay's ID
      prefill: {
        name: user?.name,
        email: user?.email,
        contact: user?.phone,
      },
      theme: { color: "#2563EB" },

      // 3. Handle Success Payment
      handler: async function (response) {
        try {
          const verifyRes = await api.post("/orders/payment/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId: orderId,
          });

          if (verifyRes.data.success) {
            onSuccess(response);
          } else {
            alert("Payment verification failed on server.");
          }
        } catch (error) {
          console.error("Verification Error:", error);
          alert("Payment verified failed.");
        }
      },
    };

    // 4. Open Popup
    const rzp1 = new window.Razorpay(options);
    rzp1.on("payment.failed", function (response) {
      alert(`Payment Failed: ${response.error.description}`);
    });

    rzp1.open();
  } catch (error) {
    console.error("Payment Error:", error);
    alert("Could not initiate payment. Try again.");
  }
};
