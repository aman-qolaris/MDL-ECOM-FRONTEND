import { memo, useMemo } from "react";
import PropTypes from "prop-types"; // 🟢 Added PropTypes import
import { Link } from "react-router-dom";
import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";

const CartItemRow = ({ item, onUpdateQuantity, onRemove }) => {
  const { product, isStockLimitReached, currentPrice, cartItemId } =
    useMemo(() => {
      const product = item.Product || {};
      const availableStock = product.availableStock || 0;
      const isStockLimitReached = item.quantity >= availableStock;
      const currentPrice = product.price || item.price || 0;
      const cartItemId = item.cartItemId || item.id;

      return {
        product,
        isStockLimitReached,
        currentPrice,
        cartItemId,
      };
    }, [item]);

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 transition hover:shadow-md">
      {/* Product Image */}
      <div className="w-24 h-24 shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
        <img
          src={
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
      <div className="grow text-center sm:text-left">
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
            onClick={() => onUpdateQuantity(cartItemId, item.quantity - 1)}
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
            onClick={() => onUpdateQuantity(cartItemId, item.quantity + 1)}
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
        onClick={() => onRemove(cartItemId)}
        className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition"
        title="Remove Item"
      >
        <FaTrash />
      </button>
    </div>
  );
};

// 🟢 Fix: Added comprehensive PropTypes validation mapping the nested 'item' object
CartItemRow.propTypes = {
  item: PropTypes.shape({
    quantity: PropTypes.number.isRequired,
    productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    cartItemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    price: PropTypes.number,
    name: PropTypes.string,
    image: PropTypes.string,
    Product: PropTypes.shape({
      availableStock: PropTypes.number,
      price: PropTypes.number,
      name: PropTypes.string,
      imageUrl: PropTypes.string,
      images: PropTypes.arrayOf(PropTypes.string),
      Category: PropTypes.shape({
        name: PropTypes.string,
      }),
    }),
  }).isRequired,
  onUpdateQuantity: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default memo(CartItemRow);
