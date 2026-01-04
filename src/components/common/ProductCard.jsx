import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addItemToCart, getCartItems } from "../../store/thunks/cartThunks";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  // Get current cart items to check existing quantity
  const { items } = useSelector((state) => state.cart);

  const handleAddToCart = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert("Please login to add items to your cart!");
      navigate("/login");
      return;
    }

    // --- STOCK CHECK LOGIC ---
    // 1. Find if this item is already in the cart
    const existingItem = items.find((item) => item.productId === product.id);
    const currentQty = existingItem ? existingItem.quantity : 0;

    // 2. Check if adding 1 more exceeds stock
    if (currentQty + 1 > product.availableStock) {
      alert(
        `Cannot add more. Only ${product.availableStock} items available in stock!`
      );
      return;
    }

    try {
      // 3. Add to cart and wait for success
      await dispatch(
        addItemToCart({ productId: product.id, quantity: 1 })
      ).unwrap();

      // 4. Update Header Icon Immediately
      dispatch(getCartItems());

      alert("Item added to cart!");
    } catch (error) {
      console.error("Failed to add to cart", error);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
      <Link
        to={`/product/${product.id}`}
        className="block overflow-hidden relative"
      >
        <div className="h-48 bg-gray-100 flex items-center justify-center relative">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-gray-400">No Image</span>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mb-2">
          {product.Category?.name || product.category?.name || "Uncategorized"}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">
            ₹{product.price}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={product.availableStock <= 0}
            className={`p-2 rounded-full transition ${
              product.availableStock > 0
                ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <FaShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
