import { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import { FaBoxOpen, FaCheck, FaTimes, FaTruck } from "react-icons/fa";

const AdminReturnRequests = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

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
    if (!window.confirm(`Are you sure you want to mark this as ${status}?`))
      return;
    try {
      await api.put(`/orders/admin/${orderId}/items/${itemId}/return-status`, {
        status,
      });
      toast.success(`Return ${status}`);
      fetchReturns();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Returns...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaBoxOpen /> Return Requests
      </h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4 border-b">Item</th>
              <th className="p-4 border-b">Customer & Reason</th>
              <th className="p-4 border-b">Pickup Status</th>
              <th className="p-4 border-b">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {returns.map((req, index) => (
              <tr
                key={`${req.itemId}-${index}`}
                className="hover:bg-gray-50 transition"
              >
                <td className="p-4">
                  <div className="font-medium text-gray-900">
                    Order #{req.orderId}
                  </div>
                  <div className="text-sm text-gray-500">
                    Item ID: {req.itemId}
                  </div>
                  <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit mt-1">
                    Refund: ₹{req.amountToRefund}
                  </div>
                </td>
                <td className="p-4 max-w-xs">
                  <div className="font-medium">{req.customerName}</div>
                  <div className="text-sm text-gray-500">
                    {req.customerPhone}
                  </div>
                  <div className="mt-2 text-sm bg-red-50 text-red-700 p-2 rounded border border-red-100">
                    "{req.reason}"
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm">
                    <span className="font-semibold">Boy:</span> {req.pickupBoy}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Status:</span>{" "}
                    {req.pickupStatus}
                  </div>
                </td>
                <td className="p-4">
                  {req.status === "REQUESTED" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleAction(req.orderId, req.itemId, "APPROVED")
                        }
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        <FaCheck /> Approve
                      </button>
                      <button
                        onClick={() =>
                          handleAction(req.orderId, req.itemId, "REJECTED")
                        }
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                      >
                        <FaTimes /> Reject
                      </button>
                    </div>
                  )}

                  {req.status === "APPROVED" && (
                    <div className="text-orange-600 text-sm font-medium flex items-center gap-2">
                      <FaTruck /> Pickup Assigned
                    </div>
                  )}

                  {/* 🟢 Admin clicks this when Boy brings item back */}
                  {req.status === "APPROVED" &&
                    req.pickupStatus === "DELIVERED" && (
                      <button
                        onClick={() =>
                          handleAction(
                            req.orderId,
                            req.itemId,
                            "RETURNED_TO_WAREHOUSE"
                          )
                        }
                        className="mt-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm w-full"
                      >
                        Confirm Received @ Warehouse
                      </button>
                    )}

                  {req.status === "COMPLETED" && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold border">
                      REFUNDED & CLOSED
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {returns.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">
                  No active return requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReturnRequests;
