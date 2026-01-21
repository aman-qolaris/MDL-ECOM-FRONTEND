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

  // Fetch Addresses on Mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await getAddresses();
      setAddresses(data);
    } catch (error) {
      console.error("Failed to load addresses", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (formData) => {
    try {
      // API Call
      await addAddress(formData);
      alert("Address Added Successfully!");

      // Reset UI
      setShowAddForm(false);
      fetchAddresses();
    } catch (error) {
      console.error(error);
      alert("Failed to add address");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await deleteAddress(id);
        // Optimistic Update
        setAddresses(addresses.filter((addr) => addr.id !== id));
      } catch (error) {
        alert("Failed to delete address");
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fadeIn min-h-[400px]">
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FaMapMarkerAlt className="text-blue-600" /> My Addresses
        </h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
          >
            <FaPlus /> Add New Address
          </button>
        )}
      </div>

      {showAddForm ? (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="font-bold text-lg mb-4">Add New Address</h3>

          {/* 🟢 REUSING ADDRESS FORM 
              This automatically handles the Dropdown for Area 
              and Fixed City/State logic. 
          */}
          <AddressForm onSubmit={handleAddSubmit} buttonText="Save Address" />

          <button
            onClick={() => setShowAddForm(false)}
            className="mt-4 text-gray-500 underline text-sm hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {loading ? (
            <p className="text-gray-500">Loading addresses...</p>
          ) : addresses.length === 0 ? (
            <div className="col-span-2 text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
              <p>No saved addresses found.</p>
            </div>
          ) : (
            addresses.map((addr) => (
              <div
                key={addr.id}
                className="relative border rounded-lg p-4 hover:shadow-md transition bg-gray-50 flex flex-col justify-between"
              >
                <div>
                  {/* Display User Name (Fallback) */}
                  <h4 className="font-bold text-gray-800">{user?.name}</h4>

                  {/* Address Details from Model */}
                  <p className="text-sm text-gray-600 mt-1">
                    {addr.addressLine1}
                  </p>
                  <p className="text-sm text-gray-600">
                    {addr.area}, {addr.city}
                  </p>
                  <p className="text-sm text-gray-600 font-semibold uppercase">
                    {addr.state}
                  </p>

                  {/* Phone (Fallback) */}
                  <p className="text-sm text-gray-500 mt-2 font-medium">
                    Phone: {user?.phone}
                  </p>
                </div>

                <div className="flex justify-end mt-4 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 transition"
                  >
                    <FaTrash /> Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AddressBookTab;
