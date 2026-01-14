import { FaPlus } from "react-icons/fa";
import AddressForm from "../../components/checkout/AddressForm";

const CheckoutShippingStep = ({
  step,
  shippingAddress,
  savedAddresses,
  selectedAddressId,
  showNewAddressForm,
  onEdit,
  onSelectAddressId,
  onShowNewAddressForm,
  onBackToSavedAddresses,
  onSubmitNewAddress,
  onDeliverSavedAddress,
}) => {
  return (
    <div
      className={`bg-white p-6 rounded-xl shadow-sm border ${
        step === 1 ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              step === 1
                ? "bg-blue-100 text-blue-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {step > 1 ? "✓" : "1"}
          </span>
          Shipping Address
        </h2>
        {step > 1 && (
          <button
            onClick={onEdit}
            className="text-sm text-blue-600 font-semibold hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      {step === 1 && (
        <div className="animate-fadeIn">
          {!showNewAddressForm && savedAddresses.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => onSelectAddressId(addr.id)}
                    className={`cursor-pointer border rounded-xl p-4 transition relative flex items-start gap-3 
                      ${
                        selectedAddressId === addr.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                  >
                    <input
                      type="radio"
                      name="savedAddress"
                      checked={selectedAddressId === addr.id}
                      onChange={() => onSelectAddressId(addr.id)}
                      className="mt-1 w-4 h-4 text-blue-600"
                    />
                    <div>
                      <p className="font-bold text-gray-900">{addr.fullName}</p>
                      <p className="text-sm text-gray-600">
                        {addr.addressLine1}
                      </p>
                      <p className="text-sm text-gray-600">
                        {addr.city}, {addr.zipCode}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        📞 {addr.phone}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button
                  onClick={onDeliverSavedAddress}
                  className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Deliver Here
                </button>
                <button
                  onClick={onShowNewAddressForm}
                  className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <FaPlus /> Add New Address
                </button>
              </div>
            </div>
          ) : (
            <div>
              {savedAddresses.length > 0 && (
                <button
                  onClick={onBackToSavedAddresses}
                  className="mb-4 text-blue-600 hover:underline text-sm font-semibold flex items-center gap-1"
                >
                  ← Back to Saved Addresses
                </button>
              )}
              <AddressForm
                onSubmit={onSubmitNewAddress}
                buttonText="Deliver Here"
              />
            </div>
          )}
        </div>
      )}

      {step > 1 && (
        <div className="text-gray-600 ml-10 text-sm">
          <p className="font-medium text-gray-900">
            {shippingAddress?.fullName}
          </p>
          <p>
            {shippingAddress?.addressLine1}, {shippingAddress?.city} -{" "}
            {shippingAddress?.zipCode}
          </p>
          <p>Phone: {shippingAddress?.phone}</p>
        </div>
      )}
    </div>
  );
};

export default CheckoutShippingStep;
