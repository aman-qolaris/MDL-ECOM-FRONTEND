import { useState } from "react";
import PropTypes from "prop-types";
import {
  FaMoneyBillWave,
  FaCreditCard,
  FaWallet,
  FaCheckCircle,
} from "react-icons/fa";

const PaymentForm = ({ onSubmit, onBack, walletUsed, payableAmount }) => {
  const [method, setMethod] = useState("cod");

  const handleSubmit = (e) => {
    e.preventDefault();
    // If payable is 0, method is irrelevant (backend sets WALLET),
    // but we pass something to satisfy prop structure.
    onSubmit({ method: payableAmount === 0 ? "wallet" : method });
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fadeIn">
      {/* 🟢 SCENARIO 1: Wallet Covers Everything */}
      {payableAmount === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center mb-6">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
            <FaCheckCircle size={30} />
          </div>
          <h3 className="text-lg font-bold text-green-800 mb-1">
            Fully Covered by Wallet
          </h3>
          <p className="text-sm text-green-700">
            Your wallet balance covers the entire order amount. No extra payment
            needed.
          </p>
          <div className="mt-4 font-bold text-2xl text-green-900">
            ₹0.00{" "}
            <span className="text-sm font-normal text-gray-500">to pay</span>
          </div>
        </div>
      ) : (
        /* 🟢 SCENARIO 2: Partial / Normal Payment */
        <>
          {walletUsed > 0 && (
            <div className="flex items-center gap-3 bg-purple-50 text-purple-700 px-4 py-3 rounded-lg mb-6 border border-purple-100">
              <FaWallet />
              <span className="text-sm font-medium">
                <span className="font-bold">₹{walletUsed}</span> from wallet
                will be used. Remaining{" "}
                <span className="font-bold">₹{payableAmount}</span> to pay via:
              </span>
            </div>
          )}

          <div className="space-y-4 mb-8">
            {/* COD Option */}
            <label
              htmlFor="payment-cod"
              aria-label="Cash on Delivery" // ✅ FIX: explicit accessible text
              className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                method === "cod"
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                id="payment-cod"
                type="radio"
                name="payment"
                value="cod"
                checked={method === "cod"}
                onChange={() => setMethod("cod")}
                className="w-5 h-5 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600">
                    <FaMoneyBillWave size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Cash on Delivery</p>
                    <p className="text-xs text-gray-500">
                      Pay cash when order arrives
                    </p>
                  </div>
                </div>
              </div>
            </label>

            {/* Online Payment Option */}
            <label
              htmlFor="payment-razorpay"
              aria-label="Pay Online via UPI, Cards or Netbanking" // ✅ FIX: explicit accessible text
              className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                method === "razorpay"
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                id="payment-razorpay"
                type="radio"
                name="payment"
                value="razorpay"
                checked={method === "razorpay"}
                onChange={() => setMethod("razorpay")}
                className="w-5 h-5 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <FaCreditCard size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Pay Online</p>
                    <p className="text-xs text-gray-500">
                      UPI, Cards, Netbanking (Razorpay)
                    </p>
                  </div>
                </div>
              </div>
            </label>
          </div>
        </>
      )}

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg transition transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {payableAmount === 0
            ? "Place Order"
            : `Pay ₹${payableAmount.toLocaleString()}`}
        </button>
      </div>
    </form>
  );
};

PaymentForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  walletUsed: PropTypes.number.isRequired,
  payableAmount: PropTypes.number.isRequired,
};

export default PaymentForm;
