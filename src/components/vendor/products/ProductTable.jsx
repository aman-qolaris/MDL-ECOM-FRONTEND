/* eslint-disable react/prop-types */
import { FaEdit, FaTrash, FaBoxOpen } from "react-icons/fa";

const ProductTable = ({ items, onEdit, onDelete }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white p-16 rounded-xl border border-gray-200 text-center shadow-sm flex flex-col items-center">
        <FaBoxOpen className="text-gray-300 text-5xl mb-4" />
        <h3 className="text-lg font-medium text-gray-800">No products found</h3>
        <p className="text-gray-500">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="p-5 font-semibold text-gray-600 text-sm w-[25%]">
              PRODUCT
            </th>
            <th className="p-5 font-semibold text-gray-600 text-sm w-[15%]">
              PRICE
            </th>
            <th className="p-5 font-semibold text-gray-600 text-sm w-[45%] text-center">
              INVENTORY STATUS
            </th>
            <th className="p-5 font-semibold text-gray-600 text-sm w-[15%] text-right">
              ACTIONS
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((product) => {
            const totalVal = product.totalStock || 0;
            const availableVal = product.availableStock || 0;
            const warehouseVal = product.warehouseStock || 0;

            return (
              <tr
                key={product.id}
                className="hover:bg-gray-50 transition-colors group"
              >
                <td className="p-5 align-middle">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                      <img
                        src={
                          product.images && product.images.length > 0
                            ? product.images[0]
                            : product.imageUrl ||
                              "https://via.placeholder.com/50"
                        }
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        ID: {product.id}
                      </p>
                      {product.Category && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full">
                          {product.Category.name}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-5 align-middle font-medium text-gray-700">
                  ₹{product.price}
                </td>
                <td className="p-5 align-middle">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase">
                        Total
                      </span>
                      <span className="font-bold text-gray-700">
                        {totalVal}
                      </span>
                    </div>
                    <div
                      className={`text-center px-4 py-2 rounded-lg border ${
                        availableVal > 0
                          ? "bg-green-50 border-green-100"
                          : "bg-red-50 border-red-100"
                      }`}
                    >
                      <span
                        className={`block text-[10px] font-bold uppercase ${
                          availableVal > 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        Available
                      </span>
                      <span
                        className={`font-bold ${
                          availableVal > 0 ? "text-green-700" : "text-red-600"
                        }`}
                      >
                        {availableVal}
                      </span>
                    </div>
                    <div className="text-center px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
                      <span className="block text-[10px] font-bold text-blue-400 uppercase">
                        Warehouse
                      </span>
                      <span className="font-bold text-blue-700">
                        {warehouseVal}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-5 align-middle text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(product)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
