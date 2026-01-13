import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // 🟢 1. Import useNavigate
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
} from "react-icons/fa";
import RefundModal from "../../components/admin/returns/RefundModal";

const AdminReturnRequests = () => {
  const navigate = useNavigate(); // 🟢 2. Initialize hook
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
      // API Call
      await api.put(`/orders/admin/${orderId}/items/${itemId}/return-status`, {
        status,
      });

      // 🟢 3. Handle Success & Redirection
      if (status === "RETURNED") {
        toast.success("Item marked as Received. Ready for Refund.");
        fetchReturns(); // Refresh to show "Process Refund" button
      } else if (status === "REFUNDED") {
        toast.success("Refund Confirmed! Redirecting to Order Details...");
        setSelectedForRefund(null);

        // 🟢 REDIRECT TO ORDER DETAILS PAGE
        setTimeout(() => {
          navigate(`/admin/orders/${orderId}`);
        }, 1000);
      } else {
        toast.success(`Return status updated to ${status}`);
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
                {/* 1. Order ID Column */}
                <td className="p-4 align-top">
                  <div className="flex flex-col gap-2">
                    <span className="font-bold text-gray-800 text-lg">
                      #{req.orderId}
                    </span>

                    <Link
                      to={`/admin/orders/${req.orderId}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline flex items-center gap-1"
                    >
                      View Order Details <FaExternalLinkAlt size={10} />
                    </Link>

                    <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit font-bold">
                      Refund: ₹
                      {req.amountToRefund || req.price * req.quantity || 0}
                    </div>
                  </div>
                </td>

                {/* 2. Customer Info */}
                <td className="p-4 max-w-xs align-top">
                  <div className="font-medium">
                    {req.customerName || req.User?.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {req.customerPhone || req.User?.phone}
                  </div>
                  <div className="mt-2 text-sm bg-red-50 text-red-700 p-2 rounded border border-red-100 italic">
                    "{req.reason || req.returnReason}"
                  </div>
                </td>

                {/* 3. Logistics Status */}
                <td className="p-4 align-top">
                  {(req.status === "APPROVED" || req.status === "RETURNED") && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase">
                        <FaTruck /> Assigned To
                      </div>
                      <div className="text-sm font-medium">
                        {req.pickupBoy || "Finding Agent..."}
                      </div>

                      <div
                        className={`text-xs px-2 py-1 rounded w-fit font-bold ${
                          req.pickupStatus === "DELIVERED"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {req.pickupStatus === "DELIVERED"
                          ? "Dropped at Warehouse"
                          : req.pickupStatus || "Pickup Pending"}
                      </div>
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
                  {/* Step 1: Approve / Reject */}
                  {req.status === "REQUESTED" && (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          handleAction(req.orderId, req.itemId, "APPROVED")
                        }
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-bold shadow-sm"
                      >
                        <FaCheck /> Approve
                      </button>
                      <button
                        onClick={() =>
                          handleAction(req.orderId, req.itemId, "REJECTED")
                        }
                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-xs font-bold"
                      >
                        <FaTimes /> Reject
                      </button>
                    </div>
                  )}

                  {/* Step 2: Waiting Logic */}
                  {req.status === "APPROVED" &&
                    req.pickupStatus !== "DELIVERED" && (
                      <span className="text-xs text-gray-400 italic">
                        Waiting for pickup...
                      </span>
                    )}

                  {/* Step 3: Confirm Received (Updates status to RETURNED) */}
                  {req.status === "APPROVED" &&
                    req.pickupStatus === "DELIVERED" && (
                      <button
                        onClick={() =>
                          handleAction(req.orderId, req.itemId, "RETURNED")
                        }
                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-bold shadow-md ml-auto"
                      >
                        <FaWarehouse /> Confirm Received
                      </button>
                    )}

                  {/* Step 4: Process Refund (Opens Modal -> Then Redirects) */}
                  {req.status === "RETURNED" && (
                    <button
                      onClick={() => setSelectedForRefund(req)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-bold shadow-md ml-auto"
                    >
                      <FaMoneyBillWave /> Process Refund
                    </button>
                  )}

                  {/* Step 5: Done */}
                  {(req.status === "REFUNDED" ||
                    req.status === "COMPLETED") && (
                    <span className="text-xs font-bold text-gray-400 flex items-center justify-end gap-1">
                      <FaUndo /> Refunded
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {returns.length === 0 && (
              <tr>
                <td colSpan="4" className="p-10 text-center text-gray-500">
                  No active return requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Render Refund Modal */}
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
