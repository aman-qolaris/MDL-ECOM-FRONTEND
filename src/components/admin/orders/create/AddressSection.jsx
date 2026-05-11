import React from "react";
import PropTypes from "prop-types"; // 🟢 Added PropTypes import
import { FiAlertCircle, FiMapPin } from "react-icons/fi";

const AddressSection = ({
  user,
  selectedAddress,
  setSelectedAddress,
  availableAreas,
  FIXED_CITY,
  FIXED_STATE,
  loading,
  registerAddress,
  handleNewAddress,
  addrErrors,
  onAddAddress,
}) => {
  if (!user) return null;

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <h2 className="flex items-center text-lg font-semibold mb-4">
        <FiMapPin className="mr-2 text-blue-600" /> Address
      </h2>

      {user.addresses && user.addresses.length > 0 ? (
        <div className="space-y-2 mb-4">
          <select
            value={selectedAddress?.id || ""}
            onChange={(e) =>
              setSelectedAddress(
                user.addresses.find((a) => a.id == e.target.value),
              )
            }
            className="w-full p-2 border rounded-lg bg-gray-50"
          >
            <option value="">-- Select Delivery Address --</option>
            {user.addresses.map((addr) => (
              <option key={addr.id} value={addr.id}>
                {addr.addressLine1}, {addr.area}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="flex items-center text-amber-600 bg-amber-50 p-3 rounded-lg mb-4 text-sm">
          <FiAlertCircle className="mr-2" /> No addresses found. Add one below.
        </div>
      )}

      {/* Add Address Form */}
      <details
        className="group"
        open={!user.addresses || user.addresses.length === 0}
      >
        <summary className="cursor-pointer text-sm text-blue-600 font-medium hover:underline">
          + Add New Address
        </summary>

        <form
          onSubmit={handleNewAddress(onAddAddress)}
          className="mt-4 space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
        >
          {/* Address Line 1 */}
          <div>
            <label className="text-xs text-gray-500">Address Line 1</label>
            <input
              {...registerAddress("addressLine1", {
                required: "Address is required",
              })}
              placeholder="House No, Building, Street"
              className="w-full p-2 border rounded-lg text-sm"
            />
            {addrErrors.addressLine1 && (
              <p className="text-red-500 text-xs">
                {addrErrors.addressLine1.message}
              </p>
            )}
          </div>

          {/* Delivery Area (Dropdown) */}
          <div>
            <label className="text-xs text-gray-500">Delivery Area</label>
            <select
              {...registerAddress("area", {
                required: "Area is required",
              })}
              className="w-full p-2 border rounded-lg text-sm bg-white"
            >
              <option value="">-- Select Area --</option>
              {availableAreas && availableAreas.length > 0 ? (
                // 🟢 Fix: Removed idx from map, used unique area string as key
                availableAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))
              ) : (
                <option disabled>Loading areas...</option>
              )}
            </select>
            {addrErrors.area && (
              <p className="text-red-500 text-xs">{addrErrors.area.message}</p>
            )}
          </div>

          {/* City & State (Locked) */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">City</label>
              <input
                {...registerAddress("city")}
                value={FIXED_CITY}
                readOnly
                className="w-full p-2 border rounded-lg text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">State</label>
              <input
                {...registerAddress("state")}
                value={FIXED_STATE}
                readOnly
                className="w-full p-2 border rounded-lg text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* ZIP CODE INPUT REMOVED */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            Save Address
          </button>
        </form>
      </details>
    </div>
  );
};

// 🟢 Fix: Added comprehensive PropTypes validation mapping nested objects
AddressSection.propTypes = {
  user: PropTypes.shape({
    addresses: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        addressLine1: PropTypes.string.isRequired,
        area: PropTypes.string.isRequired,
      }),
    ),
  }),
  selectedAddress: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  setSelectedAddress: PropTypes.func.isRequired,
  availableAreas: PropTypes.arrayOf(PropTypes.string).isRequired,
  FIXED_CITY: PropTypes.string.isRequired,
  FIXED_STATE: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  registerAddress: PropTypes.func.isRequired,
  handleNewAddress: PropTypes.func.isRequired,
  addrErrors: PropTypes.shape({
    addressLine1: PropTypes.shape({
      message: PropTypes.string,
    }),
    area: PropTypes.shape({
      message: PropTypes.string,
    }),
  }).isRequired,
  onAddAddress: PropTypes.func.isRequired,
};

export default AddressSection;
