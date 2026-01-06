import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import AddressForm from "../components/checkout/AddressForm";
import PaymentForm from "../components/checkout/PaymentForm";
// ✅ IMPORT getCartItems here
import { clearCartThunk, getCartItems } from "../store/thunks/cartThunks";
import { initiatePayment } from "../services/paymentService";
import { createOrder } from "../services/orderService";
import { getAddresses } from "../services/addressService";
import { FaPlus } from "react-icons/fa";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ NEW: State to track if we are fetching cart data
  const [isInitializing, setIsInitializing] = useState(true);

  // --- SAVED ADDRESSES STATE ---
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  // ✅ NEW: Fetch Cart & Addresses on Load
  useEffect(() => {
    const initCheckout = async () => {
      if (user) {
        try {
          // 1. Fetch Cart (Wait for this before checking items.length)
          await dispatch(getCartItems()).unwrap();

          // 2. Fetch Addresses
          const addresses = await getAddresses(user.id);
          setSavedAddresses(addresses);
          if (addresses.length > 0) {
            setSelectedAddressId(addresses[0].id);
          } else {
            setShowNewAddressForm(true);
          }
        } catch (error) {
          console.error("Failed to initialize checkout:", error);
        } finally {
          // Done loading, now we can safely render or redirect
          setIsInitializing(false);
        }
      } else {
        // If no user, stop initializing (ProtectedRoute should handle this anyway)
        setIsInitializing(false);
      }
    };

    initCheckout();
  }, [dispatch, user]);

  // ✅ LOADING CHECK: Don't redirect while we are still fetching data
  if (isInitializing) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Loading Checkout...
      </div>
    );
  }

  // ✅ NOW it is safe to redirect (only if we are done loading and it's still empty)
  if (items.length === 0 && !isPaymentSuccess) {
    return <Navigate to="/shop" replace />;
  }

  // CALCULATION
  const subtotal = items.reduce((acc, item) => {
    // Robust Price Check
    const product = item.Product || item.product || {};
    const price = product.price || item.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const shippingCost = subtotal > 1000 ? 0 : 50;
  const total = subtotal + shippingCost;

  // HANDLERS
  const handleNewAddressSubmit = (addressData) => {
    setShippingAddress(addressData);
    setStep(2);
  };

  const handleSavedAddressSubmit = () => {
    const selected = savedAddresses.find(
      (addr) => addr.id === selectedAddressId
    );
    if (selected) {
      setShippingAddress(selected);
      setStep(2);
    }
  };

  // ... existing imports

  const handleOrderSubmit = async (paymentData) => {
    try {
      setLoading(true);

      const payload = {
        userId: user?.id,
        items: items.map((item) => ({
          productId: item.productId,
          vendorId: item.Product?.vendorId || item.vendorId || null,
          quantity: item.quantity,
          price: item.Product?.price || item.price,
        })),
        amount: total,
        address: shippingAddress,
      };

      // --- 1. COD Flow ---
      if (paymentData.method === "cod") {
        const orderPayload = {
          ...payload,
          paymentMethod: "COD",
          payment: false,
        };
        const response = await createOrder(orderPayload);

        setIsPaymentSuccess(true);
        navigate("/order-success", {
          state: {
            orderId: response.orderId || response.id,
            orderDetails: { itemCount: items.length, totalAmount: total },
          },
        });
        dispatch(clearCartThunk());
        return;
      }

      // --- 2. Razorpay Flow ---
      if (paymentData.method === "razorpay") {
        // A. Create Order in Database FIRST (Status: PROCESSING, Payment: False)
        const orderPayload = {
          ...payload,
          paymentMethod: "RAZORPAY",
          payment: false,
        };
        const dbOrder = await createOrder(orderPayload);

        // Get the real Order ID from DB response
        const dbOrderId = dbOrder.orderId || dbOrder.id;

        // B. Now Initiate Payment using that ID
        await initiatePayment(
          total,
          user,
          dbOrderId,
          async (paymentResponse) => {
            // C. On Success (Backend has already verified and updated status to PAID)
            setIsPaymentSuccess(true);

            navigate("/order-success", {
              state: {
                orderId: dbOrderId,
                orderDetails: { itemCount: items.length, totalAmount: total },
              },
            });
            dispatch(clearCartThunk());
          }
        );
      }
    } catch (error) {
      console.error("Order Failed:", error);
      alert(
        "Order processing failed: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">
          Processing secure payment...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:w-2/3 space-y-6">
          {/* STEP 1: SHIPPING ADDRESS */}
          <div
            className={`bg-white p-6 rounded-xl shadow-sm border ${
              step === 1
                ? "border-blue-500 ring-1 ring-blue-500"
                : "border-gray-200"
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
                  onClick={() => setStep(1)}
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
                          onClick={() => setSelectedAddressId(addr.id)}
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
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1 w-4 h-4 text-blue-600"
                          />
                          <div>
                            <p className="font-bold text-gray-900">
                              {addr.fullName}
                            </p>
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
                        onClick={handleSavedAddressSubmit}
                        className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
                      >
                        Deliver Here
                      </button>
                      <button
                        onClick={() => setShowNewAddressForm(true)}
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
                        onClick={() => setShowNewAddressForm(false)}
                        className="mb-4 text-blue-600 hover:underline text-sm font-semibold flex items-center gap-1"
                      >
                        ← Back to Saved Addresses
                      </button>
                    )}
                    <AddressForm
                      onSubmit={handleNewAddressSubmit}
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

          {/* STEP 2: PAYMENT */}
          <div
            className={`bg-white p-6 rounded-xl shadow-sm border ${
              step === 2
                ? "border-blue-500 ring-1 ring-blue-500"
                : "border-gray-200"
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
                onSubmit={handleOrderSubmit}
                onBack={() => setStep(1)}
              />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SUMMARY */}
        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-24">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Order Summary
            </h2>
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => {
                // FIXED DATA ACCESS: Use nested Product object
                const product = item.Product || item.product || {};
                const price = product.price || item.price || 0;

                return (
                  <div
                    key={item.id || item.cartItemId}
                    className="flex gap-4 items-center"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                      {/* Fixed Image Access */}
                      <img
                        src={
                          product.imageUrl ||
                          item.image ||
                          "https://via.placeholder.com/64"
                        }
                        alt={product.name || item.name || "Product"}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1">
                      {/* Fixed Name Access */}
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                        {product.name || item.name || "Unknown Product"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-800">
                      ₹{(price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Totals Calculation */}
            <div className="border-t border-gray-100 pt-4 space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                {shippingCost === 0 ? (
                  <span className="text-green-600 font-medium">Free</span>
                ) : (
                  <span>₹{shippingCost}</span>
                )}
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-100 mt-2">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
