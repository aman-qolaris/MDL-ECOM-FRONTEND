import React from "react";
import { FiPlus, FiShoppingCart, FiTrash2 } from "react-icons/fi";

const ItemsSection = ({
  productQuery,
  setProductQuery,
  searchProducts,
  searchResults,
  addToCart,
  cart,
  removeFromCart,
}) => {
  return (
    <>
      <h2 className="flex items-center text-lg font-semibold mb-4">
        <FiShoppingCart className="mr-2 text-orange-600" /> Order Items
      </h2>

      {/* Product Search */}
      <div className="flex gap-2 mb-4">
        <input
          value={productQuery}
          onChange={(e) => setProductQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchProducts(productQuery)}
          placeholder="Search products by name..."
          className="flex-1 p-2 border rounded-lg"
        />
        <button
          onClick={() => searchProducts(productQuery)}
          className="bg-gray-800 text-white px-6 rounded-lg hover:bg-gray-900"
        >
          Search
        </button>
      </div>

      {/* Product Results */}
      {searchResults?.length > 0 && (
        <div className="mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
            Select Products to Add
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {searchResults.map((prod) => (
              <div
                key={prod.id}
                className="flex justify-between items-center bg-white p-3 rounded shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={prod.images?.[0] || "https://via.placeholder.com/50"}
                    className="w-10 h-10 object-cover rounded bg-gray-200"
                    alt=""
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {prod.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      ₹{prod.price} | Stock: {prod.availableStock}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => addToCart(prod)}
                  className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors"
                  title="Add to Cart"
                >
                  <FiPlus size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cart Table */}
      <div className="flex-grow overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="p-3 font-semibold">Product</th>
              <th className="p-3 font-semibold">Price</th>
              <th className="p-3 font-semibold">Qty</th>
              <th className="p-3 font-semibold">Total</th>
              <th className="p-3 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {cart.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-3">{item.name}</td>
                <td className="p-3">₹{item.price}</td>
                <td className="p-3">{item.quantity}</td>
                <td className="p-3 font-medium">
                  ₹{item.price * item.quantity}
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
            {cart.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="p-8 text-center text-gray-400 italic"
                >
                  Cart is currently empty
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ItemsSection;
