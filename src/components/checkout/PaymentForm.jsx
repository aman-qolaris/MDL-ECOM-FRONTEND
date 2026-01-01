import { useState } from "react";
import { FaMoneyBillWave, FaCreditCard } from "react-icons/fa";

const PaymentForm = ({ paymentMethod, setPaymentMethod, onBack, onSubmit }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Payment Method</h2>

      <div className="space-y-4 mb-6">
        {/* OPTION 1: RAZORPAY (Single Row with Logo) */}
        <label
          className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${
            paymentMethod === "razorpay"
              ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
              : "border-gray-200 hover:border-blue-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="payment"
              value="razorpay"
              checked={paymentMethod === "razorpay"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span className="font-semibold text-gray-700">Pay Online</span>
          </div>
          {/* Razorpay Logo Image */}
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg"
            alt="Razorpay"
            className="h-6 object-contain"
          />
        </label>

        {/* OPTION 2: CASH ON DELIVERY (COD) */}
        <label
          className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
            paymentMethod === "cod"
              ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
              : "border-gray-200 hover:border-blue-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span className="font-semibold text-gray-700">
              Cash on Delivery
            </span>
          </div>
          <FaMoneyBillWave className="ml-auto text-green-600 text-xl" />
        </label>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 font-medium px-6 py-2"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
        >
          {paymentMethod === "cod" ? "Place Order" : "Pay Now"}
        </button>
      </div>
    </div>
  );
};

export default PaymentForm;
