import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import useDeferredRender from "../hooks/useDeferredRender";
import {
  getCartItems,
  updateItemQuantity,
  removeItem,
} from "../store/thunks/cartThunks";
import {
  getFeaturedProducts, // Import featured thunk
} from "../store/thunks/productThunks";
import { selectCartItems, selectCartLoading } from "../store/slices/cartSlice";
import {
  selectFeaturedProducts, // Import featured selector
} from "../store/slices/productSlice";
import { FaArrowLeft } from "react-icons/fa";
import api from "../services/api"; // Import API for trending
import ProductCard from "../components/common/ProductCard"; // Import ProductCard

import CartEmptyState from "../components/cart/CartEmptyState";
import CartItemRow from "../components/cart/CartItemRow";
import CartSectionHeader from "../components/cart/CartSectionHeader";
import CartSummary from "../components/cart/CartSummary";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const hasFetchedCartRef = useRef(false);

  // Defer recommendation sections (and their network calls) so cart UI paints fast.
  const renderBelowFold = useDeferredRender();

  // --- Selectors ---
  const items = useSelector(selectCartItems);
  const loading = useSelector(selectCartLoading);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const featuredProducts = useSelector(selectFeaturedProducts);

  // --- Local State for Trending ---
  const [trendingProducts, setTrendingProducts] = useState([]);

  // --- 1. Fetch Cart Data ---
  useEffect(() => {
    if (!isAuthenticated) {
      hasFetchedCartRef.current = false;
      return;
    }

    // React StrictMode (dev) can run effects twice on mount.
    if (hasFetchedCartRef.current) return;
    hasFetchedCartRef.current = true;
    dispatch(getCartItems());
  }, [dispatch, isAuthenticated]);

  // --- 2. Fetch Featured & Trending Data ---
  useEffect(() => {
    if (!renderBelowFold) return;

    // A. Featured (Redux)
    dispatch(getFeaturedProducts());

    // B. Trending (Local API - Simulate by Price High)
    const fetchTrending = async () => {
      try {
        const res = await api.get("/products?sort=price_high");
        setTrendingProducts(res.data.slice(0, 4)); // Take top 4
      } catch (err) {
        console.error("Failed to fetch trending in cart:", err);
      }
    };
    fetchTrending();
  }, [dispatch, renderBelowFold]);

  // --- Calculate Totals ---
  const cartTotal = useMemo(() => {
    return items.reduce((total, item) => {
      const price = item.Product?.price || item.price || 0;
      return total + price * item.quantity;
    }, 0);
  }, [items]);

  const grandTotal = useMemo(() => cartTotal, [cartTotal]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);
  const handleCheckout = useCallback(() => navigate("/checkout"), [navigate]);

  const handleUpdateQuantity = useCallback(
    (cartItemId, quantity) => {
      dispatch(updateItemQuantity({ cartItemId, quantity }));
    },
    [dispatch]
  );

  const handleRemove = useCallback(
    (cartItemId) => {
      dispatch(removeItem(cartItemId));
    },
    [dispatch]
  );

  // --- Early Returns (Auth & Loading) ---
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

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition-colors font-medium"
      >
        <FaArrowLeft /> Back
      </button>

      <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">
        Shopping Cart {items.length > 0 && `(${items.length} items)`}
      </h1>

      {/* --- CONDITIONAL RENDER: Empty vs Populated Cart --- */}
      {items.length === 0 ? (
        // Empty Cart State
        <CartEmptyState />
      ) : (
        // Populated Cart State
        <div className="flex flex-col lg:flex-row gap-10">
          {/* --- Cart Items List --- */}
          <div className="lg:w-2/3 space-y-4">
            {items.map((item) => (
              <CartItemRow
                key={item.cartItemId || item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
              />
            ))}
          </div>

          {/* --- Order Summary --- */}
          <div className="lg:w-1/3">
            <CartSummary
              cartTotal={cartTotal}
              grandTotal={grandTotal}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      )}

      {/* --- 3. TRENDING PRODUCTS --- */}
      {renderBelowFold && trendingProducts.length > 0 && (
        <section className="animate-fade-in-up mt-12">
          <CartSectionHeader title="Trending Now" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {trendingProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* --- 4. FEATURED PRODUCTS --- */}
      {renderBelowFold && featuredProducts.length > 0 && (
        <section className="animate-fade-in-up mt-8 delay-100">
          <CartSectionHeader title="You May Also Like" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Cart;
