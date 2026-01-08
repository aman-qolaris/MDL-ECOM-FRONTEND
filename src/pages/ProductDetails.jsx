import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearCurrentProduct } from "../store/slices/productSlice";
import { getProduct } from "../store/thunks/productThunks";
import { dummyProducts } from "../data/dummyData";
import { FaShoppingCart, FaArrowLeft, FaStar } from "react-icons/fa";
import { addItemToCart, getCartItems } from "../store/thunks/cartThunks";

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct, loading } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  // Get cart items for stock validation
  const { items: cartItems } = useSelector((state) => state.cart);

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    dispatch(getProduct(id));
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, id]);

  const product =
    currentProduct || dummyProducts.find((p) => p.id === parseInt(id));

  // Add this inside the ProductDetails component - MUST be before any conditional returns
  useEffect(() => {
    if (product) {
      // Ensure product data is loaded
      try {
        // 1. Get existing history
        const existing =
          JSON.parse(localStorage.getItem("recentlyViewed")) || [];

        // 2. Remove if duplicate (so we can move it to the top)
        const filtered = existing.filter((item) => item.id !== product.id);

        // 3. Add current product to the front
        const newItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.imageUrl || product.image, // Handle different naming conventions
        };

        // 4. Save back to local storage (Limit to 8 items)
        const updatedList = [newItem, ...filtered].slice(0, 8);
        localStorage.setItem("recentlyViewed", JSON.stringify(updatedList));
      } catch (err) {
        console.error("Failed to save recent view:", err);
      }
    }
  }, [product]); // Runs whenever 'product' changes

  if (loading)
    return <div className="text-center py-20 text-xl">Loading...</div>;
  if (!product)
    return (
      <div className="text-center py-20 text-red-500">Product not found.</div>
    );

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }

    // --- STOCK VALIDATION ---
    const existingItem = cartItems.find(
      (item) => item.productId === product.id
    );
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;

    if (currentQtyInCart + quantity > product.availableStock) {
      alert(
        `Stock Limit Reached! You already have ${currentQtyInCart} in cart. Only ${product.availableStock} available in total.`
      );
      return;
    }

    if (quantity > 0) {
      await dispatch(
        addItemToCart({ productId: product.id, quantity })
      ).unwrap();
      await dispatch(getCartItems()).unwrap(); // Refresh Header Icon
      alert(`${product.name} added to cart!`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Back Button */}
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition"
      >
        <FaArrowLeft /> Back to Shop
      </Link>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-10 flex items-center justify-center">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-[420px] w-full object-contain transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Details Section */}
          <div className="p-10 flex flex-col justify-between">
            <div>
              {/* Category */}
              <span className="inline-block mb-3 bg-blue-50 text-blue-700 text-xs px-4 py-1 rounded-full uppercase font-semibold tracking-wide">
                {product.Category?.name || product.category?.name || "General"}
              </span>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
                {product.name}
              </h1>

              {/* Rating (UI placeholder – logic untouched) */}
              <div className="flex items-center gap-1 text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} />
                ))}
                <span className="text-sm text-gray-500 ml-2">(4.8)</span>
              </div>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed mb-6">
                {product.description || "No description available."}
              </p>

              {/* Price + Stock */}
              <div className="flex items-center gap-4 mb-8">
                <span className="text-3xl font-bold text-blue-600">
                  ₹{product.price}
                </span>
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    product.availableStock > 0
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {product.availableStock > 0
                    ? `In Stock (${product.availableStock})`
                    : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 pt-6">
              {product.availableStock > 0 && (
                <div className="flex items-center justify-between mb-6">
                  <span className="font-medium text-gray-700">Quantity</span>

                  <div className="flex items-center rounded-xl border border-gray-300 overflow-hidden">
                    <button
                      className="px-4 py-2 text-lg hover:bg-gray-100 transition"
                      onClick={() => setQuantity((q) => Math.max(0, q - 1))}
                    >
                      −
                    </button>
                    <span className="px-6 font-semibold">{quantity}</span>
                    <button
                      className="px-4 py-2 text-lg hover:bg-gray-100 transition"
                      onClick={() =>
                        setQuantity((q) =>
                          Math.min(product.availableStock, q + 1)
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={quantity === 0 || product.availableStock === 0}
                className={`w-full py-4 rounded-xl text-lg font-bold transition flex items-center justify-center gap-3 shadow-lg ${
                  quantity === 0 || product.availableStock === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl"
                }`}
              >
                <FaShoppingCart />
                {product.availableStock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
