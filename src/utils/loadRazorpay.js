export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // 1. Check if script is already loaded
    if (document.getElementById("razorpay-sdk")) {
      resolve(true);
      return;
    }

    // 2. Create script tag
    const script = document.createElement("script"); // nosonar
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js"; // nosonar
    script.async = true;

    // 3. Handle load success
    script.onload = () => {
      resolve(true);
    };

    // 4. Handle load error
    script.onerror = () => {
      resolve(false);
    };

    // 5. Append to body
    document.body.appendChild(script);
  });
};
