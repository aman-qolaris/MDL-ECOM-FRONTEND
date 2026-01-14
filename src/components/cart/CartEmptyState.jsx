import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

const CartEmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-6 mb-12">
      <div className="bg-gray-100 p-6 rounded-full mb-6">
        <FaTrash className="text-4xl text-gray-400" />
      </div>
      <h2 className="text-3xl font-bold mb-4 text-gray-800">
        Your Cart is Empty
      </h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Looks like you haven't added anything yet. Check out our trending items
        below!
      </p>
      <Link
        to="/shop"
        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:bg-blue-700 transition transform hover:-translate-y-1"
      >
        Start Shopping
      </Link>
    </div>
  );
};

export default CartEmptyState;
