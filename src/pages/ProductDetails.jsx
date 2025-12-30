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

    if (currentQtyInCart + quantity > product.stock) {
      alert(
        `Stock Limit Reached! You already have ${currentQtyInCart} in cart. Only ${product.stock} available in total.`
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

  // Add this inside the ProductDetails component
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

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/shop"
        className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition"
      >
        <FaArrowLeft className="mr-2" /> Back to Shop
      </Link>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Section */}
          <div className="p-8 bg-gray-50 flex items-center justify-center">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-96 w-full object-contain"
            />
          </div>

          {/* Details Section */}
          <div className="p-8 flex flex-col justify-center">
            <div className="mb-2">
              <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full uppercase font-semibold">
                {product.Category?.name || product.category?.name || "General"}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>

            {/* ... Rating code ... */}

            <p className="text-gray-600 mb-6 leading-relaxed">
              {product.description || "No description available."}
            </p>

            <div className="flex items-center mb-6">
              <span className="text-3xl font-bold text-blue-600">
                ₹{product.price}
              </span>
              <span
                className={`ml-4 text-sm font-medium px-2 py-1 rounded ${
                  product.stock > 0
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {product.stock > 0
                  ? `In Stock (${product.stock})`
                  : "Out of Stock"}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-6">
              {product.stock > 0 && (
                <div className="flex items-center space-x-4 mb-4">
                  <label className="text-gray-700 font-medium">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      className="px-3 py-1 hover:bg-gray-100 border-r"
                      onClick={() => setQuantity((q) => Math.max(0, q - 1))}
                    >
                      -
                    </button>
                    <span className="px-4 font-medium">{quantity}</span>
                    <button
                      className="px-3 py-1 hover:bg-gray-100 border-l"
                      onClick={() =>
                        setQuantity((q) => Math.min(product.stock, q + 1))
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={quantity === 0 || product.stock === 0}
                className={`w-full py-3 rounded-lg font-bold shadow-md transition flex items-center justify-center gap-2 ${
                  quantity === 0 || product.stock === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <FaShoppingCart />{" "}
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
