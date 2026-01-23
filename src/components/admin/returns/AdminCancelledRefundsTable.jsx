import { Link } from "react-router-dom";
import { FaBox, FaExternalLinkAlt, FaWallet } from "react-icons/fa";

const AdminCancelledRefundsTable = ({
  items,
  lastItemElementRef,
  onRefund,
  onViewCreditNote,
}) => {
  return (
    <table className="w-full text-left border-collapse">
      <thead className="bg-gray-50 text-gray-600 text-sm uppercase sticky top-0 z-10">
        <tr>
          <th className="p-4 border-b">Item Details</th>
          <th className="p-4 border-b">Cancel Reason</th>
          <th className="p-4 border-b">Order Info</th>
          <th className="p-4 border-b">Refund Amount</th>
          <th className="p-4 border-b text-right">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.map((item, index) => {
          const isLast = items.length === index + 1;

          const creditNoteData = {
            itemId: item.id,
            orderId: item.orderId || item.Order?.id,
            productName: item.Product?.name,
            quantity: item.quantity,
            amountToRefund: parseFloat(item.price) * item.quantity,
            reason: item.returnReason || "Cancellation",
            status: "CREDITED",
            customerName: item.Order?.address?.fullName || "Customer",
            customerPhone: item.Order?.address?.phone || "N/A",
          };

          return (
            <tr
              key={`${item.id}-${index}`}
              ref={isLast ? lastItemElementRef : null}
              className="hover:bg-gray-50 transition"
            >
              <td className="p-4 align-top">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 flex-shrink-0">
                    {item.Product?.imageUrl ? (
                      <img
                        src={item.Product.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaBox className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-800 line-clamp-1">
                      {item.Product?.name || `Product ID: ${item.productId}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
              </td>

              <td className="p-4 align-top">
                <div
                  className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded inline-block max-w-[200px] truncate"
                  title={item.returnReason}
                >
                  {item.returnReason || "Customer Cancelled"}
                </div>
              </td>

              <td className="p-4 align-top">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-gray-800">
                    #{item.orderId || item.Order?.id}
                  </span>
                  <Link
                    to={`/admin/orders/${item.orderId || item.Order?.id}`}
                    className="text-blue-600 hover:underline text-xs font-bold flex items-center gap-1"
                  >
                    View Order <FaExternalLinkAlt size={8} />
                  </Link>
                  <div className="text-xs text-gray-500">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </td>

              <td className="p-4 font-bold text-gray-800 align-top">
                ₹{(parseFloat(item.price) * item.quantity).toLocaleString()}
              </td>

              <td className="p-4 text-right align-top">
                {item.refundStatus === "CREDITED" ? (
                  <button
                    onClick={() => onViewCreditNote(creditNoteData)}
                    className="text-xs text-purple-600 font-bold hover:underline bg-purple-50 px-2 py-1 rounded ml-auto block"
                  >
                    View Credit Note
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      onRefund({
                        orderId: item.Order?.id || item.orderId,
                        itemId: item.id,
                        amountToRefund: parseFloat(item.price) * item.quantity,
                        customerName: "Customer",
                      })
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-md text-sm flex items-center gap-2 ml-auto"
                  >
                    <FaWallet /> Refund
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default AdminCancelledRefundsTable;
