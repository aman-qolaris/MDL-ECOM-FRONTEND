import { FaRedo, FaUndo } from "react-icons/fa";
import ReturnRequestModal from "../ReturnRequestModal";

const OrderDetailFooter = ({
  onOrderAgain,
  addingToCart,
  isOrderActive,
  onCancelOrder,
  canReturnOrder,
  onReturnOrder,
  returningOrder,
  onClose,
  selectedReturnItem,
  orderId,
  onReturnItemClose,
  onReturnItemSuccess,
}) => {
  return (
    <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-wrap justify-between items-center rounded-b-xl gap-2">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onOrderAgain}
          disabled={addingToCart}
          className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:bg-blue-400"
        >
          {addingToCart ? (
            "Adding..."
          ) : (
            <>
              <FaRedo /> Order Again
            </>
          )}
        </button>

        {isOrderActive && (
          <button
            onClick={onCancelOrder}
            className="px-4 py-2 text-red-600 font-bold hover:bg-red-100 rounded-lg transition flex items-center gap-2"
          >
            Cancel Order
          </button>
        )}

        {canReturnOrder && (
          <button
            onClick={onReturnOrder}
            disabled={returningOrder}
            className="px-4 py-2 bg-orange-100 text-orange-700 font-bold border border-orange-200 rounded-lg hover:bg-orange-200 transition flex items-center gap-2 disabled:opacity-50"
          >
            {returningOrder ? (
              "Processing..."
            ) : (
              <>
                <FaUndo /> Return Order
              </>
            )}
          </button>
        )}

        {selectedReturnItem && (
          <ReturnRequestModal
            orderId={orderId}
            item={selectedReturnItem}
            onClose={onReturnItemClose}
            onSuccess={onReturnItemSuccess}
          />
        )}
      </div>

      <button
        onClick={onClose}
        className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition"
      >
        Close
      </button>
    </div>
  );
};

export default OrderDetailFooter;
