import { useMemo } from "react";

const CheckoutOrderSummary = ({ items, subtotal, shippingCost, total }) => {
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
        <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-100 mt-2">
          <span>Total</span>
          <span>₹{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutOrderSummary;
