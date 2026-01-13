import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  getCartItems,
  updateItemQuantity,
  removeItem,
} from "../store/thunks/cartThunks";
// 1. Import specific selectors
import { selectCartItems, selectCartLoading } from "../store/slices/cartSlice";
import {
  FaTrash,
  FaArrowRight,
  FaMinus,
  FaPlus,
  FaArrowLeft,
} from "react-icons/fa";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 2. Use specific selectors to prevent unnecessary re-renders
  const items = useSelector(selectCartItems);
  const loading = useSelector(selectCartLoading);

  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCartItems());
    }
  }, [dispatch, isAuthenticated]);

  // --- Calculate Totals ---
  // We keep this calculation here to safely handle the nested
  // "item.Product.price" vs "item.price" logic specific to your backend data.
  const cartTotal = items.reduce((total, item) => {
    const price = item.Product?.price || item.price || 0;
    return total + price * item.quantity;
  }, 0);

  // Shipping Logic: Free > ₹1000, else ₹50
  const shippingCost = cartTotal > 1000 ? 0 : 50;
  const grandTotal = cartTotal + shippingCost;

  // --- Early Returns ---
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Please Login</h2>
        <p className="mb-6 text-gray-600">
          You need to be logged in to view your cart.
        </p>
        <Link
          to="/login"
          className="bg-blue-600 text-white px-8 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition transform hover:scale-105"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-500 text-lg font-medium">
        Loading your cart...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="bg-gray-100 p-6 rounded-full mb-6">
          <FaTrash className="text-4xl text-gray-400" />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-gray-800">
          Your Cart is Empty
        </h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Looks like you haven't added anything yet. Explore our products and
          find something you love!
        </p>
        <Link
          to="/shop"
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:bg-blue-700 transition transform hover:-translate-y-1"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <button
        onClick={() => navigate(-1)} //
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition-colors font-medium"
      >
        <FaArrowLeft /> Back
      </button>
      <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">
        Shopping Cart ({items.length} items)
      </h1>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* --- Cart Items List --- */}
        <div className="lg:w-2/3 space-y-4">
          {items.map((item) => {
            // Helper constants for this item
            const product = item.Product || {};
            const stock = product.availableStock || 0;
            const isStockLimitReached = item.quantity >= stock;
            const currentPrice = product.price || item.price || 0;

            return (
              <div
                key={item.cartItemId || item.id}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 transition hover:shadow-md"
              >
                {/* Product Image */}
                <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                  <img
                    src={
                      // 🔴 FIXED: Check product.images[0] first
                      product.images?.[0] ||
                      product.imageUrl ||
                      item.image ||
                      "https://via.placeholder.com/150"
                    }
                    alt={product.name || item.name}
                    className="w-full h-full object-contain p-2"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-grow text-center sm:text-left">
                  <Link
                    to={`/product/${item.productId}`}
                    className="text-lg font-bold text-gray-800 hover:text-blue-600 transition line-clamp-1"
                  >
                    {product.name || item.name || "Product Name"}
                  </Link>
                  {product.Category && (
                    <p className="text-sm text-gray-400 mt-1">
                      Category: {product.Category.name}
                    </p>
                  )}
                  <p className="text-xl font-bold text-blue-600 mt-2">
                    ₹{currentPrice.toLocaleString()}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      className="px-3 py-2 hover:bg-gray-200 disabled:opacity-30 transition text-gray-600"
                      onClick={() =>
                        dispatch(
                          updateItemQuantity({
                            cartItemId: item.cartItemId || item.id,
                            quantity: item.quantity - 1,
                          })
                        )
                      }
                      disabled={item.quantity <= 1}
                    >
                      <FaMinus size={10} />
                    </button>
                    <span className="px-3 font-semibold text-gray-800 w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      className={`px-3 py-2 transition ${
                        isStockLimitReached
                          ? "opacity-30 cursor-not-allowed"
                          : "hover:bg-gray-200 text-gray-600"
                      }`}
                      onClick={() =>
                        dispatch(
                          updateItemQuantity({
                            cartItemId: item.cartItemId || item.id,
                            quantity: item.quantity + 1,
                          })
                        )
                      }
                      disabled={isStockLimitReached}
                    >
                      <FaPlus size={10} />
                    </button>
                  </div>

                  {isStockLimitReached && (
                    <span className="text-[10px] text-red-500 font-medium">
                      Max Stock Reached
                    </span>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() =>
                    dispatch(removeItem(item.cartItemId || item.id))
                  }
                  className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition"
                  title="Remove Item"
                >
                  <FaTrash />
                </button>
              </div>
            );
          })}
        </div>

        {/* --- Order Summary --- */}
        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold mb-6 text-gray-800">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">
                  ₹{cartTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                {shippingCost === 0 ? (
                  <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded text-sm">
                    Free
                  </span>
                ) : (
                  <span className="font-medium">
                    ₹{shippingCost.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (GST)</span>
                <span className="font-medium">₹0.00</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-end">
                <span className="text-gray-800 font-bold">Total</span>
                <span className="text-2xl font-extrabold text-blue-600">
                  ₹{grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              Proceed to Checkout <FaArrowRight />
            </button>

            <Link
              to="/shop"
              className="block text-center mt-4 text-sm text-gray-500 hover:text-gray-800 font-medium transition"
            >
              Or Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
