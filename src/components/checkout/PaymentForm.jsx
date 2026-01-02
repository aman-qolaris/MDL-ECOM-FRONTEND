import { useState } from "react";
import { FaCreditCard, FaMoneyBillWave, FaMobileAlt } from "react-icons/fa";
import { SiRazorpay } from "react-icons/si";

const PaymentForm = ({ onSubmit, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [razorpayMethod, setRazorpayMethod] = useState("card"); // card or upi

  // State for Payment Details (not needed for Razorpay as it handles its own UI)
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [upiId, setUpiId] = useState("");

  const handleCardChange = (e) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // For Razorpay, we just pass the method and preferred payment type
    if (paymentMethod === "razorpay") {
      onSubmit({
        method: "razorpay",
        preferredMethod: razorpayMethod, // card or upi
      });
      return;
    }

    // For COD
    if (paymentMethod === "cod") {
      onSubmit({
        method: "cod",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fadeIn space-y-6">
      <div className="space-y-4">
        {/* === OPTION 1: RAZORPAY === */}
        <div
          className={`border rounded-xl transition overflow-hidden ${
            paymentMethod === "razorpay"
              ? "border-blue-500 ring-2 ring-blue-500"
              : "border-gray-200"
          }`}
        >
          <label
            className={`flex items-center p-4 cursor-pointer ${
              paymentMethod === "razorpay" ? "bg-blue-50" : "hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="payment"
              value="razorpay"
              checked={paymentMethod === "razorpay"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="ml-4 flex-1 flex justify-between items-center">
              <span className="font-medium text-gray-900">
                Pay with Razorpay
              </span>
              <SiRazorpay className="text-blue-600 text-2xl" />
            </div>
          </label>

          {/* RAZORPAY SUB-OPTIONS (Card/UPI) */}
          {paymentMethod === "razorpay" && (
            <div className="p-4 border-t border-blue-100 bg-white space-y-3 animate-fadeIn">
              <p className="text-sm text-gray-600 mb-3">
                Choose your preferred payment method:
              </p>

              {/* Card Option */}
              <label
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                  razorpayMethod === "card"
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="razorpayMethod"
                  value="card"
                  checked={razorpayMethod === "card"}
                  onChange={(e) => setRazorpayMethod(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <FaCreditCard className="ml-3 text-gray-600" />
                <span className="ml-2 text-sm font-medium text-gray-800">
                  Credit / Debit Card
                </span>
              </label>

              {/* UPI Option */}
              <label
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                  razorpayMethod === "upi"
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="razorpayMethod"
                  value="upi"
                  checked={razorpayMethod === "upi"}
                  onChange={(e) => setRazorpayMethod(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <FaMobileAlt className="ml-3 text-blue-600" />
                <span className="ml-2 text-sm font-medium text-gray-800">
                  UPI (GPay, PhonePe, Paytm)
                </span>
              </label>

              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600">
                  💡 You'll be redirected to Razorpay's secure payment page to
                  complete your transaction.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* === OPTION 2: COD === */}
        <div
          className={`border rounded-xl transition ${
            paymentMethod === "cod"
              ? "border-blue-500 ring-1 ring-blue-500"
              : "border-gray-200"
          }`}
        >
          <label
            className={`flex items-center p-4 cursor-pointer ${
              paymentMethod === "cod" ? "bg-blue-50" : "hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="ml-4 flex-1 flex justify-between items-center">
              <span className="font-medium text-gray-900">
                Cash on Delivery
              </span>
              <FaMoneyBillWave className="text-green-500 text-xl" />
            </div>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="w-1/3 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
        >
          Back
        </button>
        <button
          type="submit"
          className="w-2/3 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition shadow-sm"
        >
          {paymentMethod === "cod"
            ? "Place Order"
            : `Pay ₹ with Razorpay (${
                razorpayMethod === "card" ? "Card" : "UPI"
              })`}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
