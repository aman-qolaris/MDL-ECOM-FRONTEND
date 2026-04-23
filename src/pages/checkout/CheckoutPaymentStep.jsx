import PaymentForm from "../../components/checkout/PaymentForm";

const CheckoutPaymentStep = ({ step, onSubmit, onBack, payableAmount }) => {
  return (
    <div
      className={`bg-white p-4 sm:p-6 rounded-xl shadow-sm border ${
        step === 2 ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
      } ${step < 2 ? "opacity-60" : ""}`}
    >
      <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
            step === 2
              ? "bg-blue-100 text-blue-600"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          2
        </span>
        Payment Method
      </h2>

      {step === 2 && (
        <PaymentForm
          onSubmit={onSubmit}
          onBack={onBack}
          payableAmount={payableAmount}
        />
      )}
    </div>
  );
};

export default CheckoutPaymentStep;
