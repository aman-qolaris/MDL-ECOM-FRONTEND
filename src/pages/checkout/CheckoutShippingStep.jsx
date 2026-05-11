import PropTypes from "prop-types";
import { FaPlus } from "react-icons/fa";
import { useSelector } from "react-redux";
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
  onAreaChange,
}) => {
  // Get User Data for Name/Phone Fallback
  const { user } = useSelector((state) => state.auth);

  return (
    <div
      className={`bg-white p-4 sm:p-6 rounded-xl shadow-sm border ${
        step === 1 ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
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
          <span>Shipping Address</span>
        </h2>
        {step > 1 && (
          <button
            type="button"
            onClick={onEdit}
            className="text-sm text-blue-600 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-blue-300 rounded px-1"
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
                  <button
                    type="button"
                    key={addr.id}
                    onClick={() => onSelectAddressId(addr.id)}
                    className={`cursor-pointer border rounded-xl p-4 transition relative flex items-start gap-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-400
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
                      className="mt-1 w-4 h-4 text-blue-600 cursor-pointer focus:ring-blue-400"
                      // Stop propagation so the button's onClick doesn't fire twice
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      {/* Use User Name */}
                      <p className="font-bold text-gray-900">
                        {user?.name || "User"}
                      </p>

                      <p className="text-sm text-gray-600">
                        {addr.addressLine1}
                      </p>

                      {/* Show Area, City, State */}
                      <p className="text-sm text-gray-600">
                        {addr.area}, {addr.city}
                      </p>
                      <p className="text-sm text-gray-600 font-semibold uppercase">
                        {addr.state}
                      </p>

                      {/* Use User Phone */}
                      <p className="text-xs text-gray-500 mt-1">
                        📞 {user?.phone || "No Phone"}
                      </p>
                    </div>

                    {/* Optional: Show Default Badge */}
                    {addr.isDefault && (
                      <span className="absolute top-2 right-2 bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Default
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button
                  type="button"
                  onClick={onDeliverSavedAddress}
                  className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Deliver Here
                </button>
                <button
                  type="button"
                  onClick={onShowNewAddressForm}
                  className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <FaPlus /> Add New Address
                </button>
              </div>
            </div>
          ) : (
            <div>
              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={onBackToSavedAddresses}
                  className="mb-4 text-blue-600 hover:underline text-sm font-semibold flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-200 rounded px-1"
                >
                  ← Back to Saved Addresses
                </button>
              )}
              <AddressForm
                onSubmit={onSubmitNewAddress}
                onAreaChange={onAreaChange}
                buttonText="Deliver Here"
              />
            </div>
          )}
        </div>
      )}

      {/* Update Summary View (Step > 1) */}
      {step > 1 && (
        <div className="text-gray-600 ml-0 sm:ml-10 text-sm">
          <p className="font-medium text-gray-900">{user?.name}</p>
          <p>
            {shippingAddress?.addressLine1}, {shippingAddress?.area}
          </p>
          <p>
            {shippingAddress?.city}, {shippingAddress?.state}
          </p>
          <p>Phone: {user?.phone}</p>
        </div>
      )}
    </div>
  );
};

CheckoutShippingStep.propTypes = {
  step: PropTypes.number.isRequired,
  shippingAddress: PropTypes.shape({
    addressLine1: PropTypes.string,
    area: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
  }),
  savedAddresses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      addressLine1: PropTypes.string.isRequired,
      area: PropTypes.string.isRequired,
      city: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired,
      isDefault: PropTypes.bool,
    }),
  ).isRequired,
  selectedAddressId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  showNewAddressForm: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onSelectAddressId: PropTypes.func.isRequired,
  onShowNewAddressForm: PropTypes.func.isRequired,
  onBackToSavedAddresses: PropTypes.func.isRequired,
  onSubmitNewAddress: PropTypes.func.isRequired,
  onDeliverSavedAddress: PropTypes.func.isRequired,
  onAreaChange: PropTypes.func.isRequired,
};

export default CheckoutShippingStep;
