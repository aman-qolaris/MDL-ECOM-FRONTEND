import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaEye } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addItemToCart, getCartItems } from "../../store/thunks/cartThunks";
import { selectCartQuantityByProductId } from "../../store/slices/cartSlice";
import useIsAuthenticated from "../../hooks/useIsAuthenticated";
import { toast } from "react-toastify";
import SmartImage from "./SmartImage";
import { prefetchProductById } from "../../services/productService";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const currentQty = useSelector((state) =>
    selectCartQuantityByProductId(state, product?.id)
  );

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info("Please login to add items to your cart!");
      navigate("/login");
      return;
    }

    if (currentQty + 1 > product.availableStock) {
      toast.error(`Only ${product.availableStock} items available in stock!`);
      return;
    }

    try {
      const res = await dispatch(
        addItemToCart({ productId: product.id, quantity: 1 })
      ).unwrap();

      const nextItems = res?.items || res?.cart?.items || res?.data?.items;
      if (!Array.isArray(nextItems)) {
        dispatch(getCartItems());
      }
      toast.success("Item added to cart!");
    } catch (error) {
      console.error("Failed to add to cart", error);
      toast.error("Failed to add item.");
    }
  };

  const categoryName =
    product.Category?.name || product.category?.name || "General";
  const isLowStock = product.availableStock <= 5 && product.availableStock > 0;
  const isSoldOut = product.availableStock === 0;

  return (
    // 1. Adjusted Height: Changed h-[330px] to h-[365px] to fit the description
    <div className="group relative w-full mx-auto bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Image Link */}
      <Link
        to={`/product/${product.id}`}
        className="relative h-44 sm:h-[160px] overflow-hidden bg-gray-50 block"
        onMouseEnter={() => prefetchProductById(product?.id)}
        onFocus={() => prefetchProductById(product?.id)}
      >
        {/* Logic: Check 'images' array first, then fallback to 'imageUrl' */}
        {product.images?.length > 0 || product.imageUrl ? (
          <SmartImage
            src={product.images?.[0] || product.imageUrl}
            alt={product.name}
            // Kept your UI preference: object-cover
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
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
            className="p-2.5 bg-white text-gray-800 rounded-full hover:bg-indigo-600 hover:text-white transition shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300"
          >
            <FaEye />
          </button>
        </div>

        {/* Badges */}
        {isLowStock && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
            Low Stock
          </span>
        )}
        {isSoldOut && (
          <span className="absolute top-2 left-2 bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
            Sold Out
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-2.5 flex flex-col flex-grow">
        <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wider mb-1">
          {categoryName}
        </span>

        <Link to={`/product/${product.id}`} className="block">
          <h3
            className="text-sm font-bold text-gray-800 line-clamp-1 hover:text-indigo-600 transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>

        {/* 2. Added Description Logic */}
        <p className="text-xs text-gray-500 line-clamp-2 mt-1 mb-1">
          {product.description || "No description available"}
        </p>

        <div className="mt-2 flex items-center justify-between pt-2 border-t border-gray-50">
          <span className="text-lg font-extrabold text-gray-900 whitespace-nowrap">
            ₹{product.price}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 ${
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
