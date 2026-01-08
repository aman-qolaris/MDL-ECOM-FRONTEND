import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaEye } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addItemToCart, getCartItems } from "../../store/thunks/cartThunks";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Please login to add items to your cart!");
      navigate("/login");
      return;
    }

    const existingItem = items.find((item) => item.productId === product.id);
    const currentQty = existingItem ? existingItem.quantity : 0;

    if (currentQty + 1 > product.availableStock) {
      alert(
        `Cannot add more. Only ${product.availableStock} items available in stock!`
      );
      return;
    }

    try {
      await dispatch(
        addItemToCart({ productId: product.id, quantity: 1 })
      ).unwrap();
      dispatch(getCartItems());
      alert("Item added to cart!");
    } catch (error) {
      console.error("Failed to add to cart", error);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-[330px]">
      {/* Image Section */}
      <Link
        to={`/product/${product.id}`}
        className="relative h-[180px] overflow-hidden bg-gray-50"
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
            No Image
          </div>
        )}

        {/* Overlay Action */}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={() => navigate(`/product/${product.id}`)}
            className="p-3 bg-white text-gray-800 rounded-full hover:bg-indigo-600 hover:text-white transition shadow-lg"
            title="View Details"
          >
            <FaEye />
          </button>
        </div>

        {/* Badges */}
        {product.availableStock <= 5 && product.availableStock > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            Low Stock
          </span>
        )}
        {product.availableStock === 0 && (
          <span className="absolute top-3 left-3 bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            Sold Out
          </span>
        )}
      </Link>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Category */}
        <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wider mb-1">
          {product.Category?.name || product.category?.name || "General"}
        </span>

        {/* Title */}
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-bold text-gray-800 line-clamp-2 hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Bottom */}
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-extrabold text-gray-900">
            ₹{product.price}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={product.availableStock <= 0}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md ${
              product.availableStock > 0
                ? "bg-gray-900 text-white hover:bg-indigo-600 hover:scale-110"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            title="Add to Cart"
          >
            <FaShoppingCart size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
