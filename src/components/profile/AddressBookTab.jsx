import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FaMapMarkerAlt, FaPlus, FaTrash } from "react-icons/fa";
import {
  getAddresses,
  addAddress,
  deleteAddress,
} from "../../services/addressService";
import AddressForm from "../checkout/AddressForm";

const AddressBookTab = () => {
  const { user } = useSelector((state) => state.auth);
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Addresses on Mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAddresses();
      setAddresses(data);
    } catch (err) {
      console.error("Failed to load addresses", err);
      setError("Failed to load addresses. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (formData) => {
    try {
      await addAddress(formData);
      globalThis.alert("Address Added Successfully!");

      setShowAddForm(false);
      fetchAddresses();
    } catch (err) {
      console.error(err);
      globalThis.alert("Failed to add address. Please verify your details.");
    }
  };

  const handleDelete = async (id) => {
    if (globalThis.confirm("Are you sure you want to delete this address?")) {
      try {
        await deleteAddress(id);
        setAddresses(addresses.filter((addr) => addr.id !== id));
      } catch (err) {
        console.error(err);
        globalThis.alert("Failed to delete address. Please try again.");
      }
    }
  };

  // 🟢 FIX: Function now always returns a single React element (Type Consistency)
  const renderContent = () => {
    if (loading) {
      return <p className="text-gray-500">Loading addresses...</p>;
    }

    if (error) {
      return <p className="text-red-500 font-medium">{error}</p>;
    }

    if (addresses.length === 0) {
      return (
        <div className="col-span-2 text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
          <p>No saved addresses found.</p>
        </div>
      );
    }

    return (
      <>
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="relative border rounded-lg p-4 hover:shadow-md transition bg-gray-50 flex flex-col justify-between"
          >
            <div>
              <h4 className="font-bold text-gray-800">{user?.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{addr.addressLine1}</p>
              <p className="text-sm text-gray-600">
                {addr.area}, {addr.city}
              </p>
              <p className="text-sm text-gray-600 font-semibold uppercase">
                {addr.state}
              </p>
              <p className="text-sm text-gray-500 mt-2 font-medium">
                Phone: {user?.phone}
              </p>
            </div>

            <div className="flex justify-end mt-4 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => handleDelete(addr.id)}
                className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 transition focus:outline-none focus:ring-2 focus:ring-red-500/50 rounded px-2 py-1"
              >
                <FaTrash /> Remove
              </button>
            </div>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fadeIn min-h-[400px]">
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FaMapMarkerAlt className="text-blue-600" /> My Addresses
        </h2>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <FaPlus /> Add New Address
          </button>
        )}
      </div>

      {showAddForm ? (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="font-bold text-lg mb-4">Add New Address</h3>

          <AddressForm onSubmit={handleAddSubmit} buttonText="Save Address" />

          <button
            type="button"
            onClick={() => setShowAddForm(false)}
            className="mt-4 text-gray-500 underline text-sm hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded px-1"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">{renderContent()}</div>
      )}
    </div>
  );
};

export default AddressBookTab;
