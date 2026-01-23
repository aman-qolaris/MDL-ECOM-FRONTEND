import { Link } from "react-router-dom";
import { FaBox, FaCheck, FaExternalLinkAlt, FaTruck } from "react-icons/fa";

const AdminReturnsTable = ({
  items,
  lastItemElementRef,
  onAction,
  onOpenReassign,
  onCreateCreditNote,
  onViewCreditNote,
}) => {
  return (
    <table className="w-full text-left border-collapse">
      <thead className="bg-gray-50 text-gray-600 text-sm uppercase sticky top-0 z-10">
        <tr>
          <th className="p-4 border-b">Item Details</th>
          <th className="p-4 border-b">Reason</th>
          <th className="p-4 border-b">Order Info</th>
          <th className="p-4 border-b">Customer</th>
          <th className="p-4 border-b">Status</th>
          <th className="p-4 border-b text-right">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.map((req, index) => {
          const isLast = items.length === index + 1;
          return (
            <tr
              key={`${req.itemId}-${index}`}
              ref={isLast ? lastItemElementRef : null}
              className="hover:bg-gray-50 transition"
            >
              <td className="p-4 align-top">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 flex-shrink-0">
                    {req.productImage ? (
                      <img
                        src={req.productImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaBox className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-800 line-clamp-1">
                      {req.productName || "Product Name N/A"}
                    </p>
                    <p className="text-xs text-gray-500">Qty: {req.quantity}</p>
                  </div>
                </div>
              </td>
              <td className="p-4 align-top">
                <div
                  className="text-sm text-gray-600 max-w-[150px] truncate"
                  title={req.reason}
                >
                  {req.reason || "No Reason"}
                </div>
              </td>
              <td className="p-4 align-top">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-gray-800">
                    #{req.orderId}
                  </span>
                  <Link
                    to={`/admin/orders/${req.orderId}`}
                    className="text-blue-600 hover:underline text-xs font-bold flex items-center gap-1"
                  >
                    View Order <FaExternalLinkAlt size={8} />
                  </Link>
                  <div className="text-xs text-blue-700 font-bold">
                    Refund: ₹{req.amountToRefund}
                  </div>
                </div>
              </td>
              <td className="p-4 max-w-xs align-top">
                <div className="font-medium text-sm">{req.customerName}</div>
                <div className="text-xs text-gray-500">{req.customerPhone}</div>
              </td>
              <td className="p-4 align-top">
                {req.status === "REQUESTED" && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold">
                    Pending
                  </span>
                )}
                {["APPROVED", "PICKUP_SCHEDULED"].includes(req.status) && (
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-gray-500">
                      <FaTruck className="inline mr-1" />{" "}
                      {req.pickupBoy || "Unassigned"}
                    </div>
                    {req.status === "PICKUP_SCHEDULED" && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">
                        In Transit
                      </span>
                    )}
                  </div>
                )}
                {req.status === "RETURNED" && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold">
                    Warehouse
                  </span>
                )}
                {req.status === "COMPLETED" && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-bold">
                    Verified
                  </span>
                )}
                {(req.status === "REFUNDED" || req.status === "CREDITED") && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold flex items-center gap-1 w-fit">
                    <FaCheck size={10} /> Credited
                  </span>
                )}
                {req.status === "REJECTED" && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">
                    Rejected
                  </span>
                )}
              </td>
              <td className="p-4 text-right align-top">
                {req.status === "REQUESTED" && (
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() =>
                        onAction(req.orderId, req.itemId, "APPROVED")
                      }
                      className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        onAction(req.orderId, req.itemId, "REJECTED")
                      }
                      className="px-3 py-1.5 border border-red-200 text-red-600 rounded text-xs font-bold hover:bg-red-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {["APPROVED", "PICKUP_SCHEDULED"].includes(req.status) && (
                  <button
                    onClick={() => onOpenReassign(req)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold ml-auto block hover:bg-blue-700"
                  >
                    Reassign
                  </button>
                )}
                {req.status === "RETURNED" && (
                  <button
                    onClick={() =>
                      onAction(req.orderId, req.itemId, "COMPLETED")
                    }
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-bold ml-auto block hover:bg-indigo-700"
                  >
                    Verify Item
                  </button>
                )}
                {req.status === "COMPLETED" && (
                  <button
                    onClick={() => onCreateCreditNote(req)}
                    className="px-4 py-2 bg-purple-600 text-white rounded text-xs font-bold shadow-md ml-auto block hover:bg-purple-700"
                  >
                    Create Credit Note
                  </button>
                )}
                {(req.status === "REFUNDED" || req.status === "CREDITED") && (
                  <button
                    onClick={() => onViewCreditNote(req)}
                    className="text-xs text-purple-600 font-bold hover:underline bg-purple-50 px-2 py-1 rounded ml-auto block"
                  >
                    View Credit Note
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

export default AdminReturnsTable;
