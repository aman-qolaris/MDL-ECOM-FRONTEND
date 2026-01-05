import { useState } from "react";
import { FaMoneyBillWave } from "react-icons/fa";
import { SiRazorpay } from "react-icons/si";

const PaymentForm = ({ onSubmit, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simply return the selected high-level method
    onSubmit({
      method: paymentMethod,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fadeIn space-y-6">
      <div className="space-y-4">
        {/* === OPTION 1: RAZORPAY === */}
        <div
          onClick={() => setPaymentMethod("razorpay")}
          className={`border rounded-xl transition overflow-hidden cursor-pointer ${
            paymentMethod === "razorpay"
              ? "border-blue-500 ring-2 ring-blue-500 bg-blue-50"
              : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center p-4">
            <input
              type="radio"
              name="payment"
              value="razorpay"
              checked={paymentMethod === "razorpay"}
              onChange={() => setPaymentMethod("razorpay")}
              className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
            />
            <div className="ml-4 flex-1 flex justify-between items-center">
              <div>
                <span className="font-bold text-gray-900 block">
                  Pay Online (Razorpay)
                </span>
                <span className="text-xs text-gray-500">
                  Credit/Debit Card, UPI, NetBanking, Wallets
                </span>
              </div>
              <SiRazorpay className="text-blue-600 text-3xl" />
            </div>
          </div>
        </div>

        {/* === OPTION 2: COD === */}
        <div
          onClick={() => setPaymentMethod("cod")}
          className={`border rounded-xl transition overflow-hidden cursor-pointer ${
            paymentMethod === "cod"
              ? "border-green-500 ring-2 ring-green-500 bg-green-50"
              : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center p-4">
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={() => setPaymentMethod("cod")}
              className="w-5 h-5 text-green-600 focus:ring-green-500 border-gray-300 cursor-pointer"
            />
            <div className="ml-4 flex-1 flex justify-between items-center">
              <div>
                <span className="font-bold text-gray-900 block">
                  Cash on Delivery
                </span>
                <span className="text-xs text-gray-500">
                  Pay with cash upon delivery
                </span>
              </div>
              <FaMoneyBillWave className="text-green-600 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Info Message */}
      {paymentMethod === "razorpay" && (
        <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg border border-blue-100 flex items-center gap-2">
          <span>🔒</span>
          You will be redirected to the secure Razorpay payment gateway to
          complete your transaction.
        </div>
      )}

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
          className={`w-2/3 text-white font-bold py-3 rounded-lg shadow-md transition transform active:scale-95 flex justify-center items-center gap-2 ${
            paymentMethod === "razorpay"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {paymentMethod === "cod" ? "Place COD Order" : "Proceed to Payment"}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
