import PropTypes from "prop-types";
import { FaTimes } from "react-icons/fa";

const OrderDetailHeader = ({ orderId, onClose }) => {
  return (
    <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
        <p className="text-sm text-gray-500 font-mono">#{orderId}</p>
      </div>
      <button
        onClick={onClose}
        aria-label="Close order details"
        className="text-gray-400 hover:text-red-500 transition p-2 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
      >
        <FaTimes size={20} />
      </button>
    </div>
  );
};

OrderDetailHeader.propTypes = {
  orderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default OrderDetailHeader;
