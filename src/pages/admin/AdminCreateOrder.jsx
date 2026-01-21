import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import {
  searchUserByPhone,
  registerUserOnBehalf,
  addUserAddressOnBehalf,
  createOrderOnBehalf,
} from "../../services/adminService";
import { getDeliveryLocations } from "../../services/orderService";
import api from "../../services/api";
import useDebounce from "../../hooks/useDebounce"; // 🟢 1. Import Hook
import {
  FiSearch,
  FiUser,
  FiMapPin,
  FiShoppingCart,
  FiPlus,
  FiTrash2,
  FiAlertCircle,
} from "react-icons/fi";

const AdminCreateOrder = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Delivery Logic State
  const [availableAreas, setAvailableAreas] = useState([]);
  const FIXED_CITY = "Raipur";
  const FIXED_STATE = "Chhattisgarh";

  // Product Search State
  const [productQuery, setProductQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [cart, setCart] = useState([]);

  // 🟢 2. Use the Debounce Hook (500ms delay)
  const debouncedProductSearch = useDebounce(productQuery, 500);

  // --- FORMS SETUP ---
  const {
    register: registerSearch,
    handleSubmit: handleSearch,
    formState: { errors: searchErrors },
  } = useForm();

  const {
    register: registerNewUser,
    handleSubmit: handleNewUser,
    formState: { errors: userErrors },
  } = useForm();

  const {
    register: registerAddress,
    handleSubmit: handleNewAddress,
    formState: { errors: addrErrors },
    reset: resetAddressForm,
  } = useForm({
    defaultValues: {
      city: FIXED_CITY,
      state: FIXED_STATE,
    },
  });

  // --- FETCH DELIVERY AREAS ON MOUNT ---
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await getDeliveryLocations();
        const raipurAreas = data?.[FIXED_STATE]?.[FIXED_CITY] || [];
        setAvailableAreas(raipurAreas);
      } catch (error) {
        console.error("Failed to load delivery areas", error);
        toast.error("Could not load delivery areas");
      }
    };
    fetchAreas();
  }, []);

  // 🟢 3. Effect: Trigger Search when Debounced Value Changes
  useEffect(() => {
    if (debouncedProductSearch) {
      searchProducts(debouncedProductSearch);
    } else {
      setSearchResults([]); // Clear results if input is empty
    }
  }, [debouncedProductSearch]);

  const handleNumberInput = (e, maxLength) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > maxLength) {
      e.target.value = value.slice(0, maxLength);
    } else {
      e.target.value = value;
    }
  };

  // 1. SEARCH USER
  const onSearchUser = async (data) => {
    setLoading(true);
    try {
      const foundUser = await searchUserByPhone(data.phone);
      setUser(foundUser);
      toast.success("User found!");
      if (foundUser.addresses?.length > 0) {
        const def =
          foundUser.addresses.find((a) => a.isDefault) ||
          foundUser.addresses[0];
        setSelectedAddress(def);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error("User not found. Please register.");
        setUser(null);
      } else {
        toast.error("Search failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. REGISTER NEW USER
  const onRegisterUser = async (data) => {
    setLoading(true);
    try {
      const payload = { ...data, password: "Password@123" };
      const res = await registerUserOnBehalf(payload);
      setUser(res.user);
      toast.success("User registered! Default password: Password@123");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // 3. ADD ADDRESS
  const onAddAddress = async (data) => {
    setLoading(true);
    try {
      const res = await addUserAddressOnBehalf({
        userId: user.id,
        ...data,
        city: FIXED_CITY,
        state: FIXED_STATE,
        isDefault: true,
      });

      const newAddr = res.address;
      const updatedUser = {
        ...user,
        addresses: [...(user.addresses || []), newAddr],
      };
      setUser(updatedUser);
      setSelectedAddress(newAddr);
      resetAddressForm({ city: FIXED_CITY, state: FIXED_STATE });
      toast.success("Address added");
    } catch (error) {
      toast.error("Failed to add address");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 4. Updated Search Function (Safeguarded)
  const searchProducts = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await api.get(`/products?search=${query}&limit=5`);

      // 🟢 FIX: Ensure we always set an array, even if API returns null/undefined
      // Check if response is { products: [...] } OR just [...]
      const products =
        res.data.products || (Array.isArray(res.data) ? res.data : []);

      setSearchResults(products);
    } catch (err) {
      console.error("Product Search Error:", err);
      setSearchResults([]); // Fallback to empty array on error
    }
  };

  // 5. CART OPERATIONS
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  // 6. PLACE ORDER
  const placeOrder = async () => {
    if (!user || !selectedAddress || cart.length === 0) {
      return toast.error("Please complete all steps (User, Address, Items)");
    }
    setLoading(true);
    try {
      const itemsPayload = cart.map((item) => ({
        productId: item.id,
        vendorId: item.vendorId,
        quantity: item.quantity,
        price: item.price,
      }));

      const totalAmount = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // 🟢 CRITICAL FIX: Construct a complete 'shippingAddress' object
      // The Order Service expects 'fullName' inside this object to display the name.
      const finalShippingAddress = {
        fullName: user.name, // 👈 This fixes "Guest" -> "User Name"
        phone: user.phone,
        addressLine1: selectedAddress.addressLine1, // Ensure these keys match DB
        area: selectedAddress.area,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zipCode: selectedAddress.zipCode || "492001", // Fallback if missing
      };

      await createOrderOnBehalf({
        userId: user.id,
        items: itemsPayload,
        amount: totalAmount,
        address: finalShippingAddress, // 👈 Send the fixed object
        paymentMethod: "COD",
      });

      toast.success("Order Placed Successfully!");
      setUser(null);
      setSelectedAddress(null);
      setCart([]);
      setSearchResults([]);
      setProductQuery("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Create Order (Admin Console)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: User & Address */}
        <div className="lg:col-span-1 space-y-6">
          {/* STEP 1: USER SEARCH / REGISTER */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h2 className="flex items-center text-lg font-semibold mb-4">
              <FiUser className="mr-2 text-purple-600" /> Customer
            </h2>

            {!user ? (
              <>
                <form onSubmit={handleSearch(onSearchUser)} className="mb-6">
                  <div className="flex gap-2">
                    <input
                      {...registerSearch("phone", {
                        required: "Phone is required",
                        minLength: { value: 10, message: "Must be 10 digits" },
                        maxLength: { value: 10, message: "Must be 10 digits" },
                      })}
                      type="text"
                      placeholder="Search Phone (10 digits)"
                      onInput={(e) => handleNumberInput(e, 10)}
                      className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-purple-600 text-white p-2 rounded-lg"
                    >
                      <FiSearch />
                    </button>
                  </div>
                  {searchErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">
                      {searchErrors.phone.message}
                    </p>
                  )}
                </form>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">
                    OR REGISTER NEW
                  </span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <form
                  onSubmit={handleNewUser(onRegisterUser)}
                  className="space-y-3 mt-2"
                >
                  <div>
                    <input
                      {...registerNewUser("name", {
                        required: "Name is required",
                      })}
                      placeholder="Full Name"
                      className="w-full p-2 border rounded-lg"
                    />
                    {userErrors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {userErrors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      {...registerNewUser("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      placeholder="Email"
                      className="w-full p-2 border rounded-lg"
                    />
                    {userErrors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {userErrors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      {...registerNewUser("phone", {
                        required: "Phone is required",
                        minLength: { value: 10, message: "Must be 10 digits" },
                      })}
                      type="text"
                      placeholder="Phone (10 digits)"
                      onInput={(e) => handleNumberInput(e, 10)}
                      className="w-full p-2 border rounded-lg"
                    />
                    {userErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {userErrors.phone.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Register Customer
                  </button>
                </form>
              </>
            ) : (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 relative">
                <button
                  onClick={() => {
                    setUser(null);
                    setSelectedAddress(null);
                  }}
                  className="absolute top-2 right-2 text-xs text-red-500 underline"
                >
                  Change
                </button>
                <p className="font-bold text-green-800">{user.name}</p>
                <p className="text-sm text-green-700">{user.phone}</p>
                <p className="text-sm text-green-700">{user.email}</p>
              </div>
            )}
          </div>

          {/* STEP 2: ADDRESS */}
          {user && (
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
                        user.addresses.find((a) => a.id == e.target.value)
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
                  <FiAlertCircle className="mr-2" /> No addresses found. Add one
                  below.
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
                    <label className="text-xs text-gray-500">
                      Address Line 1
                    </label>
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
                    <label className="text-xs text-gray-500">
                      Delivery Area
                    </label>
                    <select
                      {...registerAddress("area", {
                        required: "Area is required",
                      })}
                      className="w-full p-2 border rounded-lg text-sm bg-white"
                    >
                      <option value="">-- Select Area --</option>
                      {availableAreas.map((area, idx) => (
                        <option key={idx} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                    {addrErrors.area && (
                      <p className="text-red-500 text-xs">
                        {addrErrors.area.message}
                      </p>
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

                  {/* Zip Code */}
                  <div>
                    <label className="text-xs text-gray-500">Zip Code</label>
                    <input
                      {...registerAddress("zipCode", {
                        required: "Zip Code is required",
                        minLength: { value: 6, message: "Invalid Zip" },
                      })}
                      placeholder="Zip Code"
                      maxLength={6}
                      onInput={(e) => handleNumberInput(e, 6)}
                      className="w-full p-2 border rounded-lg text-sm"
                    />
                    {addrErrors.zipCode && (
                      <p className="text-red-500 text-xs">
                        {addrErrors.zipCode.message}
                      </p>
                    )}
                  </div>

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
          )}
        </div>

        {/* RIGHT COLUMN: Product Selection & Cart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 min-h-[600px] flex flex-col">
            <h2 className="flex items-center text-lg font-semibold mb-4">
              <FiShoppingCart className="mr-2 text-orange-600" /> Order Items
            </h2>

            {/* Product Search */}
            <div className="flex gap-2 mb-4">
              <input
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && searchProducts(productQuery)
                }
                placeholder="Search products by name..."
                className="flex-1 p-2 border rounded-lg"
              />
              <button
                onClick={() => searchProducts(productQuery)}
                className="bg-gray-800 text-white px-6 rounded-lg hover:bg-gray-900"
              >
                Search
              </button>
            </div>

            {/* 🟢 FIX: Add '?' before .length to prevent crash if undefined */}
            {searchResults?.length > 0 && (
              <div className="mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                  Select Products to Add
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {searchResults.map((prod) => (
                    <div
                      key={prod.id}
                      className="flex justify-between items-center bg-white p-3 rounded shadow-sm border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            prod.images?.[0] || "https://via.placeholder.com/50"
                          }
                          className="w-10 h-10 object-cover rounded bg-gray-200"
                          alt=""
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {prod.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            ₹{prod.price} | Stock: {prod.stock}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => addToCart(prod)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors"
                        title="Add to Cart"
                      >
                        <FiPlus size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cart Table */}
            <div className="flex-grow overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-50 text-gray-600 border-b">
                  <tr>
                    <th className="p-3 font-semibold">Product</th>
                    <th className="p-3 font-semibold">Price</th>
                    <th className="p-3 font-semibold">Qty</th>
                    <th className="p-3 font-semibold">Total</th>
                    <th className="p-3 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {cart.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-3">{item.name}</td>
                      <td className="p-3">₹{item.price}</td>
                      <td className="p-3">{item.quantity}</td>
                      <td className="p-3 font-medium">
                        ₹{item.price * item.quantity}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {cart.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-8 text-center text-gray-400 italic"
                      >
                        Cart is currently empty
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary & Submit */}
            <div className="mt-6 pt-6 border-t bg-gray-50 -mx-5 -mb-5 p-5 rounded-b-xl flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-500 text-sm">Payment Method</p>
                <div className="flex items-center mt-1">
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded border border-green-200">
                    COD
                  </span>
                  <span className="ml-2 text-sm font-semibold text-gray-700">
                    Cash on Delivery
                  </span>
                </div>
              </div>
              <div className="text-right flex items-center gap-6">
                <div>
                  <p className="text-sm text-gray-500">Total Payable</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ₹{cart.reduce((sum, i) => sum + i.price * i.quantity, 0)}
                  </p>
                </div>
                <button
                  onClick={placeOrder}
                  disabled={loading || cart.length === 0 || !selectedAddress}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all transform active:scale-95"
                >
                  {loading ? "Placing Order..." : "Confirm Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateOrder;
