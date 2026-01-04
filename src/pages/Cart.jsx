import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  getCartItems,
  updateItemQuantity,
  removeItem,
} from "../store/thunks/cartThunks";
import { FaTrash, FaArrowRight } from "react-icons/fa";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCartItems());
    }
  }, [dispatch, isAuthenticated]);

  // Calculate Total
  const cartTotal = items.reduce((total, item) => {
    // Safety check for nested Product
    const price = item.price || item.Product?.price || 0;
    return total + price * item.quantity;
  }, 0);

  // Shipping: free for orders over ₹1000, otherwise ₹50
  const shippingCost = cartTotal > 1000 ? 0 : 50;
  const total = cartTotal + shippingCost;

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Please Login</h2>
        <p className="mb-6 text-gray-600">
          You need to be logged in to view your cart.
        </p>
        <Link
          to="/login"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  if (loading) return <div className="text-center py-20">Loading cart...</div>;

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Your Cart is Empty
        </h2>
        <p className="text-gray-500 mb-8">
          Looks like you haven't added anything yet.
        </p>
        <Link
          to="/shop"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items List */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {items.map((item) => (
              <div
                key={item.cartItemId || item.id}
                className="p-6 border-b border-gray-100 last:border-0 flex flex-col sm:flex-row items-center gap-4"
              >
                {/* Image */}
                <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden">
                  <img
                    src={
                      item.image ||
                      item.Product?.imageUrl ||
                      "https://via.placeholder.com/150"
                    }
                    alt={item.name || item.Product?.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Details */}
                <div className="flex-grow text-center sm:text-left">
                  <Link
                    to={`/product/${item.productId}`}
                    className="text-lg font-semibold text-gray-800 hover:text-blue-600"
                  >
                    {item.name || item.Product?.name || "Unknown Product"}
                  </Link>
                  {/* <p className="text-gray-500 text-sm mt-1">
                    {item.Product?.category?.name ||
                      item.Product?.Category?.name}
                  </p> */}
                  <p className="font-bold text-blue-600 mt-2">
                    ₹{item.price || item.Product?.price}
                  </p>
                </div>

                {/* Quantity & Actions */}
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
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
                      -
                    </button>
                    <span className="px-3 font-medium text-sm">
                      {item.quantity}
                    </span>
                    // ✅ New Code (Add disabled condition)
                    <button
                      className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                      disabled={
                        item.quantity >= (item.Product?.availableStock || 0)
                      } // Prevents going over stock
                      onClick={() =>
                        dispatch(
                          updateItemQuantity({
                            cartItemId: item.cartItemId || item.id,
                            quantity: item.quantity + 1,
                          })
                        )
                      }
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      dispatch(removeItem(item.cartItemId || item.id))
                    }
                    className="text-red-500 text-sm hover:underline flex items-center"
                  >
                    <FaTrash className="mr-1" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6 text-gray-800">
              Order Summary
            </h2>

            <div className="space-y-3 text-gray-600 mb-6 border-b border-gray-100 pb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                {shippingCost === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  <span>₹{shippingCost.toFixed(2)}</span>
                )}
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹0.00</span>
              </div>
            </div>

            <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center"
            >
              Proceed to Checkout <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
