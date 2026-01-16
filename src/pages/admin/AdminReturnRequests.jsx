import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  FaBoxOpen,
  FaCheck,
  FaTimes,
  FaTruck,
  FaMoneyBillWave,
  FaUndo,
  FaWarehouse,
  FaExternalLinkAlt,
  FaClipboardCheck,
} from "react-icons/fa";
import RefundModal from "../../components/admin/returns/RefundModal";

const AdminReturnRequests = () => {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForRefund, setSelectedForRefund] = useState(null);

  const fetchReturns = async () => {
    try {
      const { data } = await api.get("/orders/admin/returns/all");
      setReturns(data);
    } catch (err) {
      toast.error("Failed to load returns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleAction = async (orderId, itemId, status) => {
    if (
      status === "REJECTED" &&
      !window.confirm("Are you sure you want to REJECT this return?")
    )
      return;

    try {
      await api.put(`/orders/admin/${orderId}/items/${itemId}/return-status`, {
        status,
      });

      if (status === "RETURNED") {
        toast.success("Item Marked as Dropped at Warehouse");
        fetchReturns();
      } else if (status === "COMPLETED") {
        toast.success("Item Verified & Restocked Successfully!");
        fetchReturns();
      } else if (status === "REFUNDED") {
        toast.success("Refund Confirmed! Redirecting...");
        setSelectedForRefund(null);
        setTimeout(() => {
          navigate(`/admin/orders/${orderId}`);
        }, 1000);
      } else {
        toast.success(`Status updated to ${status}`);
        fetchReturns();
      }
    } catch (err) {
      console.error("Action Error:", err);
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading Returns...</div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaBoxOpen className="text-blue-600" /> Return Requests
      </h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4 border-b">Order ID</th>
              <th className="p-4 border-b">Customer & Reason</th>
              <th className="p-4 border-b">Logistics Status</th>
              <th className="p-4 border-b text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {returns.map((req, index) => (
              <tr
                key={`${req.itemId}-${index}`}
                className="hover:bg-gray-50 transition"
              >
                {/* 1. Order ID */}
                <td className="p-4 align-top">
                  <div className="flex flex-col gap-2">
                    <span className="font-bold text-gray-800 text-lg">
                      #{req.orderId}
                    </span>
                    <Link
                      to={`/admin/orders/${req.orderId}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline flex items-center gap-1"
                    >
                      View Order <FaExternalLinkAlt size={10} />
                    </Link>
                    <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit font-bold">
                      Refund: ₹{req.amountToRefund || 0}
                    </div>
                  </div>
                </td>

                {/* 2. Customer Info */}
                <td className="p-4 max-w-xs align-top">
                  <div className="font-medium">
                    {req.customerName || "Guest User"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {req.customerPhone}
                  </div>
                  <div className="mt-2 text-sm bg-red-50 text-red-700 p-2 rounded border border-red-100 italic">
                    "{req.reason}"
                  </div>
                </td>

                {/* 3. Logistics Status */}
                <td className="p-4 align-top">
                  {[
                    "APPROVED",
                    "PICKUP_SCHEDULED",
                    "RETURNED",
                    "COMPLETED",
                  ].includes(req.status) && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase">
                        <FaTruck /> Assigned To
                      </div>
                      <div className="text-sm font-medium">
                        {req.pickupBoy || "Finding Agent..."}
                      </div>

                      {/* Status Badges */}
                      {req.status === "PICKUP_SCHEDULED" && (
                        <div className="text-xs px-2 py-1 rounded w-fit font-bold bg-blue-100 text-blue-700 flex items-center gap-1">
                          <FaTruck /> In Transit
                        </div>
                      )}

                      {req.status === "RETURNED" && (
                        <div className="text-xs px-2 py-1 rounded w-fit font-bold bg-orange-100 text-orange-700 flex items-center gap-1">
                          <FaWarehouse /> Dropped at Warehouse
                        </div>
                      )}

                      {req.status === "COMPLETED" && (
                        <div className="text-xs px-2 py-1 rounded w-fit font-bold bg-purple-100 text-purple-700 flex items-center gap-1">
                          <FaCheck /> Verified & Restocked
                        </div>
                      )}
                    </div>
                  )}

                  {req.status === "REQUESTED" && (
                    <span className="text-gray-400 italic">
                      Pending Approval
                    </span>
                  )}
                  {req.status === "REFUNDED" && (
                    <span className="text-green-600 font-bold flex items-center gap-1">
                      <FaCheck /> Complete
                    </span>
                  )}
                  {req.status === "REJECTED" && (
                    <span className="text-red-500 font-bold flex items-center gap-1">
                      <FaTimes /> Rejected
                    </span>
                  )}
                </td>

                {/* 4. Action Buttons */}
                <td className="p-4 text-right align-top">
                  {/* Step 1: Initial Approval */}
                  {req.status === "REQUESTED" && (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          handleAction(req.orderId, req.itemId, "APPROVED")
                        }
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleAction(req.orderId, req.itemId, "REJECTED")
                        }
                        className="px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {/* Step 2: Manual Confirm (Fallback if Delivery Boy doesn't update) */}
                  {req.status === "APPROVED" && (
                    <button
                      onClick={() =>
                        handleAction(req.orderId, req.itemId, "RETURNED")
                      }
                      className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-xs font-bold shadow-md ml-auto"
                    >
                      <FaWarehouse /> Confirm Received
                    </button>
                  )}

                  {/* Step 3: VERIFY (This calls COMPLETED) */}
                  {req.status === "RETURNED" && (
                    <button
                      onClick={() =>
                        handleAction(req.orderId, req.itemId, "COMPLETED")
                      }
                      className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-bold shadow-md ml-auto"
                    >
                      <FaClipboardCheck /> Verify Item
                    </button>
                  )}

                  {/* Step 4: Refund */}
                  {req.status === "COMPLETED" && (
                    <button
                      onClick={() => setSelectedForRefund(req)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-bold shadow-md ml-auto"
                    >
                      <FaMoneyBillWave /> Process Refund
                    </button>
                  )}

                  {/* Done */}
                  {req.status === "REFUNDED" && (
                    <span className="text-xs font-bold text-gray-400 flex items-center justify-end gap-1">
                      <FaUndo /> Refunded
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedForRefund && (
        <RefundModal
          request={selectedForRefund}
          onClose={() => setSelectedForRefund(null)}
          onConfirm={(orderId, itemId) =>
            handleAction(orderId, itemId, "REFUNDED")
          }
        />
      )}
    </div>
  );
};

export default AdminReturnRequests;
