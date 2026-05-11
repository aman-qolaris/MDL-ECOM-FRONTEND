import { useMemo } from "react";
import PropTypes from "prop-types";
import { FaWallet } from "react-icons/fa";

const CheckoutOrderSummary = ({
  items,
  subtotal,
  shippingCost,
  total,
  walletUsed,
  payableAmount,
}) => {
  const lines = useMemo(() => {
    return items.map((item) => {
      const product = item.Product || item.product || {};
      const price = product.price || item.price || 0;
      const image =
        product.images?.[0] ||
        product.imageUrl ||
        item.image ||
        "https://via.placeholder.com/64";

      return {
        key: item.id || item.cartItemId,
        name: product.name || item.name || "Unknown Product",
        quantity: item.quantity,
        image,
        lineTotal: price * item.quantity,
      };
    });
  }, [items]);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 lg:sticky lg:top-24">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Order Summary</h2>

      <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {lines.map((line) => (
          <div key={line.key} className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden shrink-0 border border-gray-200">
              <img
                src={line.image}
                alt={line.name}
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                {line.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">Qty: {line.quantity}</p>
            </div>
            <p className="text-sm font-bold text-gray-800">
              ₹{line.lineTotal.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-4 space-y-2 text-gray-600">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          {shippingCost === 0 ? (
            <span className="text-green-600 font-medium">Free</span>
          ) : (
            <span>₹{shippingCost}</span>
          )}
        </div>

        {walletUsed > 0 && (
          <div className="flex justify-between text-purple-700 font-medium bg-purple-50 p-2 rounded-lg">
            <span className="flex items-center gap-2">
              <FaWallet /> Wallet Used
            </span>
            <span>- ₹{walletUsed.toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-100 mt-2">
          <span>To Pay</span>
          <span>₹{payableAmount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

// 🟢 FIX: Added strict PropTypes validation
CheckoutOrderSummary.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      cartItemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      quantity: PropTypes.number.isRequired,
      price: PropTypes.number,
      name: PropTypes.string,
      image: PropTypes.string,
      Product: PropTypes.shape({
        price: PropTypes.number,
        name: PropTypes.string,
        images: PropTypes.arrayOf(PropTypes.string),
        imageUrl: PropTypes.string,
      }),
      product: PropTypes.shape({
        price: PropTypes.number,
        name: PropTypes.string,
        images: PropTypes.arrayOf(PropTypes.string),
        imageUrl: PropTypes.string,
      }),
    }),
  ).isRequired,
  subtotal: PropTypes.number.isRequired,
  shippingCost: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  walletUsed: PropTypes.number.isRequired,
  payableAmount: PropTypes.number.isRequired,
};

export default CheckoutOrderSummary;
