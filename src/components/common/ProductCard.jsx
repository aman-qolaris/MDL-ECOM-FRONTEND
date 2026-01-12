import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaEye } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addItemToCart, getCartItems } from "../../store/thunks/cartThunks";
import { toast } from "react-toastify"; // Assume you have this or standard alert

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  // Optimization: Select only the specific item quantity if possible,
  // but for now, we access items safely.
  const cartItems = useSelector((state) => state.cart.items);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info("Please login to add items to your cart!");
      navigate("/login");
      return;
    }

    const existingItem = cartItems.find(
      (item) => item.productId === product.id
    );
    const currentQty = existingItem?.quantity || 0;

    if (currentQty + 1 > product.availableStock) {
      toast.error(`Only ${product.availableStock} items available in stock!`);
      return;
    }

    try {
      await dispatch(
        addItemToCart({ productId: product.id, quantity: 1 })
      ).unwrap();
      dispatch(getCartItems());
      toast.success("Item added to cart!");
    } catch (error) {
      console.error("Failed to add to cart", error);
      toast.error("Failed to add item.");
    }
  };

  // Safe checks for category
  const categoryName =
    product.Category?.name || product.category?.name || "General";
  const isLowStock = product.availableStock <= 5 && product.availableStock > 0;
  const isSoldOut = product.availableStock === 0;

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-[330px]">
      {/* Image Link */}
      <Link
        to={`/product/${product.id}`}
        className="relative h-[180px] overflow-hidden bg-gray-50 block"
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
            loading="lazy" // Performance: Lazy load off-screen images
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
            No Image
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.preventDefault();
              navigate(`/product/${product.id}`);
            }}
            className="p-3 bg-white text-gray-800 rounded-full hover:bg-indigo-600 hover:text-white transition shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300"
          >
            <FaEye />
          </button>
        </div>

        {/* Badges */}
        {isLowStock && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
            Low Stock
          </span>
        )}
        {isSoldOut && (
          <span className="absolute top-3 left-3 bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
            Sold Out
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wider mb-1">
          {categoryName}
        </span>

        <Link to={`/product/${product.id}`} className="block">
          <h3
            className="text-sm font-bold text-gray-800 line-clamp-2 hover:text-indigo-600 transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-extrabold text-gray-900">
            ₹{product.price}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 ${
              !isSoldOut
                ? "bg-gray-900 text-white hover:bg-indigo-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            title={isSoldOut ? "Out of Stock" : "Add to Cart"}
          >
            <FaShoppingCart size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
