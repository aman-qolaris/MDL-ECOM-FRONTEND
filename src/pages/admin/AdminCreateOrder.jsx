import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import {
  searchUserByPhone,
  registerUserOnBehalf,
  addUserAddressOnBehalf,
  createOrderOnBehalf,
} from "../../services/adminService";
import {
  getDeliveryLocations,
  getShippingRateForArea,
} from "../../services/orderService";
import api from "../../services/api";
import useDebounce from "../../hooks/useDebounce";

import CustomerSection from "../../components/admin/orders/create/CustomerSection";
import AddressSection from "../../components/admin/orders/create/AddressSection";
import ItemsSection from "../../components/admin/orders/create/ItemsSection";
import SummaryBar from "../../components/admin/orders/create/SummaryBar";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const AdminCreateOrder = () => {
  const navigate = useNavigate();
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

  const [shippingCost, setShippingCost] = useState(0);

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

  // Effect: Trigger Search when Debounced Value Changes
  useEffect(() => {
    if (debouncedProductSearch) {
      searchProducts(debouncedProductSearch);
    } else {
      setSearchResults([]);
    }
  }, [debouncedProductSearch]);

  // 🟢 2. NEW EFFECT: Fetch Shipping when Address Changes
  useEffect(() => {
    const fetchShipping = async () => {
      if (selectedAddress && selectedAddress.area) {
        const rate = await getShippingRateForArea(selectedAddress.area);
        setShippingCost(rate);
      } else {
        setShippingCost(0);
      }
    };
    fetchShipping();
  }, [selectedAddress]);

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

  // 4. PRODUCT SEARCH
  const searchProducts = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await api.get(`/products?search=${query}&limit=5`);
      const products =
        res.data.products || (Array.isArray(res.data) ? res.data : []);
      setSearchResults(products);
    } catch (err) {
      console.error("Product Search Error:", err);
      setSearchResults([]);
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

      // Calculate Subtotal only
      const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // 🟢 REMOVED ZIP CODE FROM PAYLOAD
      const finalShippingAddress = {
        fullName: user.name,
        phone: user.phone,
        addressLine1: selectedAddress.addressLine1,
        area: selectedAddress.area,
        city: selectedAddress.city,
        state: selectedAddress.state,
        // zipCode field removed
      };

      await createOrderOnBehalf({
        userId: user.id,
        items: itemsPayload,
        amount: subtotal,
        address: finalShippingAddress,
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

  // Helper variables for UI
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalPayable = subtotal + shippingCost;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 text-gray-600 transition shadow-sm"
        >
          <FaArrowLeft size={16} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Create Order (Admin Console)
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: User & Address */}
        <div className="lg:col-span-1 space-y-6">
          <CustomerSection
            loading={loading}
            user={user}
            setUser={setUser}
            setSelectedAddress={setSelectedAddress}
            registerSearch={registerSearch}
            handleSearch={handleSearch}
            searchErrors={searchErrors}
            onSearchUser={onSearchUser}
            registerNewUser={registerNewUser}
            handleNewUser={handleNewUser}
            userErrors={userErrors}
            onRegisterUser={onRegisterUser}
            handleNumberInput={handleNumberInput}
          />

          <AddressSection
            user={user}
            selectedAddress={selectedAddress}
            setSelectedAddress={setSelectedAddress}
            availableAreas={availableAreas}
            FIXED_CITY={FIXED_CITY}
            FIXED_STATE={FIXED_STATE}
            loading={loading}
            registerAddress={registerAddress}
            handleNewAddress={handleNewAddress}
            addrErrors={addrErrors}
            onAddAddress={onAddAddress}
          />
        </div>

        {/* RIGHT COLUMN: Product Selection & Cart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 min-h-[600px] flex flex-col">
            <ItemsSection
              productQuery={productQuery}
              setProductQuery={setProductQuery}
              searchProducts={searchProducts}
              searchResults={searchResults}
              addToCart={addToCart}
              cart={cart}
              removeFromCart={removeFromCart}
            />

            <SummaryBar
              subtotal={subtotal}
              shippingCost={shippingCost}
              totalPayable={totalPayable}
              placeOrder={placeOrder}
              loading={loading}
              cartLength={cart.length}
              hasSelectedAddress={!!selectedAddress}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateOrder;
