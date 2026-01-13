/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

const ProductHeader = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Product Inventory</h2>
        <p className="text-sm text-gray-500">
          Manage your products and stock levels
        </p>
      </div>
      <Link
        to="/vendor/products/new"
        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-all whitespace-nowrap active:scale-95"
      >
        <FaPlus size={14} /> Add New Product
      </Link>
    </div>
  );
};

export default ProductHeader;
