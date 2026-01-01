import { loadRazorpayScript } from "../utils/loadRazorpay";

// ✅ Access the key from the .env file
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

export const initiatePayment = async (amount, user, onSuccess) => {
  if (!RAZORPAY_KEY_ID) {
    alert("Razorpay Key is missing! Check your .env file.");
    return;
  }

  try {
    const isLoaded = await loadRazorpayScript();

    if (!isLoaded) {
      alert("Razorpay SDK failed to load. Check internet connection.");
      return;
    }

    const options = {
      key: RAZORPAY_KEY_ID, // Uses the key from .env
      amount: amount * 100,
      currency: "INR",
      name: "My E-Comm Store",
      description: "Order Payment",

      handler: function (response) {
        console.log("Payment Successful:", response);
        onSuccess({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
      },

      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.phone || "",
      },
      theme: {
        color: "#2563EB",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.on("payment.failed", function (response) {
      alert("Payment Failed: " + response.error.description);
    });

    paymentObject.open();
  } catch (error) {
    console.error("Payment Error:", error);
    alert("Something went wrong with payment.");
  }
};
