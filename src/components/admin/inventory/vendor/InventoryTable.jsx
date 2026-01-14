/* eslint-disable react/prop-types */
import { FaEdit } from "react-icons/fa";

const InventoryTable = ({ products, onEdit }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 w-[30%]">Product</th>
            <th className="py-3 px-6 w-[10%]">Price</th>
            <th className="py-3 px-6 w-[50%] text-center">Stock Breakdown</th>
            <th className="py-3 px-6 w-[10%] text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {products.map((product) => {
            const totalVal = product.totalStock || 0;
            const warehouseVal = product.warehouseStock || 0;
            const availableVal = product.availableStock || 0;
            const placedVal = product.reservedStock || 0;

            const categoryName = product.Category?.name || product.category;

            return (
              <tr
                key={product.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="py-3 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0">
                      <img
                        src={
                          product.images?.[0] ||
                          product.imageUrl ||
                          "https://via.placeholder.com/150"
                        }
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">
                        {product.name}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        ID: {product.id}
                      </span>
                      {categoryName && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1 rounded w-fit mt-0.5">
                          {categoryName}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                <td className="py-3 px-6 font-medium">₹{product.price}</td>

                {/* 4-BOX STOCK GRID */}
                <td className="py-3 px-6">
                  <div className="grid grid-cols-4 gap-2">
                    {/* TOTAL */}
                    <div className="flex flex-col items-center justify-center p-1.5 rounded bg-gray-100 border border-gray-200">
                      <span className="text-[9px] font-bold uppercase text-gray-500">
                        Total
                      </span>
                      <span className="text-sm font-extrabold text-gray-800">
                        {totalVal}
                      </span>
                    </div>

                    {/* AVAILABLE */}
                    <div
                      className={`flex flex-col items-center justify-center p-1.5 rounded border ${
                        availableVal > 0
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <span
                        className={`text-[9px] font-bold uppercase ${
                          availableVal > 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        Avail
                      </span>
                      <span
                        className={`text-sm font-extrabold ${
                          availableVal > 0 ? "text-green-700" : "text-red-600"
                        }`}
                      >
                        {availableVal}
                      </span>
                    </div>

                    {/* WAREHOUSE */}
                    <div className="flex flex-col items-center justify-center p-1.5 rounded bg-purple-50 border border-purple-200">
                      <span className="text-[9px] font-bold uppercase text-purple-600">
                        Ware
                      </span>
                      <span className="text-sm font-extrabold text-purple-800">
                        {warehouseVal}
                      </span>
                    </div>

                    {/* PLACED (RESERVED) */}
                    <div className="flex flex-col items-center justify-center p-1.5 rounded bg-orange-50 border border-orange-200">
                      <span className="text-[9px] font-bold uppercase text-orange-600">
                        Placed
                      </span>
                      <span className="text-sm font-extrabold text-orange-800">
                        {placedVal}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-6 text-center">
                  <button
                    onClick={() => onEdit(product)}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mx-auto transition bg-white border border-blue-200 px-3 py-1.5 rounded-md shadow-sm hover:shadow"
                    title="Update Warehouse Stock"
                  >
                    <FaEdit /> <span className="text-xs font-bold">Edit</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {products.length === 0 && (
        <div className="p-10 text-center text-gray-500">No products found.</div>
      )}
    </div>
  );
};

export default InventoryTable;
