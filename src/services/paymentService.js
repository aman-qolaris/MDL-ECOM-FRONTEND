// Toggle this to FALSE later when you have a Real Key
const USE_MOCK = true;

// You can leave this empty for now
const RAZORPAY_KEY_ID = "";

export const initiatePayment = async (amount, user, onSuccess) => {
  if (USE_MOCK) {
    console.log("Initializing Mock Payment...");

    // 1. Simulate a short network delay (like connecting to a bank)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 2. Open a Browser Confirmation Box (This acts as the "Payment Popup")
    const isConfirmed = window.confirm(
      `MOCK PAYMENT GATEWAY\n\nPay ₹${amount}?\n\n(Click 'OK' to simulate Success, 'Cancel' to simulate Failure)`
    );

    if (isConfirmed) {
      // 3. Simulate Success Response from Razorpay
      const mockResponse = {
        razorpay_payment_id: "pay_mock_" + Date.now(),
        razorpay_order_id: "order_mock_" + Date.now(),
        razorpay_signature: "mock_signature_123",
      };

      console.log("Payment Successful (Mock)!", mockResponse);
      await onSuccess(mockResponse); // <--- Triggers the "Place Order" logic
    } else {
      // 4. Simulate Failure
      throw new Error("Payment cancelled");
    }
  } else {
    // Real Backend/Razorpay Logic (We will add this later when you have a key)
    console.log("Real payment integration pending key...");
    alert("Real Payment Key missing. Switch to Mock mode.");
  }
};
