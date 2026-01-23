import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaBoxOpen,
  FaCheck,
  FaTruck,
  FaWallet,
  FaExternalLinkAlt,
  FaClipboardCheck,
  FaFileInvoice,
  FaMoneyBillWave,
  FaExchangeAlt,
} from "react-icons/fa";

// 🟢 MODALS
import RefundModal from "../../components/admin/returns/RefundModal";
import ReassignmentModal from "../../components/admin/orders/details/ReassignmentModal";
import CreditNoteModal from "../../components/admin/returns/CreditNoteModal";

// 🟢 SERVICES (Refactored imports)
import {
  getAllReturnRequests,
  updateReturnStatus,
  getCancelledRefundOrders,
} from "../../services/adminService";
import {
  getReassignmentOptions,
  reassignDeliveryBoy,
} from "../../services/orderService";

const AdminReturnRequests = () => {
  const navigate = useNavigate();

  // --- TABS STATE ---
  const [activeTab, setActiveTab] = useState("returns"); // 'returns' or 'refunds'

  // --- DATA STATE ---
  const [returns, setReturns] = useState([]);
  const [cancelledRefunds, setCancelledRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- MODAL STATE ---
  const [selectedForRefund, setSelectedForRefund] = useState(null);
  const [selectedCreditNote, setSelectedCreditNote] = useState(null);

  // Reassignment State
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignOptions, setReassignOptions] = useState([]);
  const [reassignLoading, setReassignLoading] = useState(false);
  const [targetReturn, setTargetReturn] = useState(null);
  const [selectedNewBoy, setSelectedNewBoy] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "returns") {
        // 🟢 USED SERVICE
        const data = await getAllReturnRequests();
        setReturns(data);
      } else {
        // 🟢 USED SERVICE
        const data = await getCancelledRefundOrders();
        setCancelledRefunds(data);
      }
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---

  // 1. Open Reassignment Modal
  const handleOpenReassign = async (req) => {
    setTargetReturn(req);
    setReassignModalOpen(true);
    setReassignLoading(true);
    setSelectedNewBoy(null);

    try {
      // 🟢 USED SERVICE
      const data = await getReassignmentOptions(req.orderId);
      setReassignOptions(data.options);
    } catch (err) {
      toast.error("Failed to load delivery boys");
      setReassignModalOpen(false);
    } finally {
      setReassignLoading(false);
    }
  };

  // 2. Confirm Reassignment
  const handleConfirmReassign = async () => {
    if (!selectedNewBoy) return toast.warning("Please select a partner");

    try {
      // 🟢 USED SERVICE (Passing null for oldBoyId as it's not strictly required by your API logic)
      await reassignDeliveryBoy(targetReturn.orderId, null, selectedNewBoy.id);

      toast.success("Delivery Partner Reassigned");

      // Optimistic Update
      setReturns((prev) =>
        prev.map((item) =>
          item.orderId === targetReturn.orderId
            ? { ...item, pickupBoy: selectedNewBoy.name }
            : item
        )
      );

      setReassignModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Reassignment Failed");
    }
  };

  // 3. Handle Status Actions (Approve, Reject, Verify, Refund)
  const handleAction = async (orderId, itemId, status) => {
    if (
      status === "REJECTED" &&
      !window.confirm("Are you sure you want to REJECT?")
    )
      return;

    try {
      // 🟢 USED SERVICE
      await updateReturnStatus(orderId, itemId, status);

      toast.success(
        status === "CREDITED"
          ? "Refund Processed Successfully!"
          : `Status updated to ${status}`
      );
      setSelectedForRefund(null);
      fetchData(); // Refresh list to reflect changes
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  // --- RENDER HELPERS ---

  // Table for Prepaid Cancellations (Pending Refunds)
  const renderCancelledTable = () => (
    <table className="w-full text-left border-collapse">
      <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
        <tr>
          <th className="p-4 border-b">Order Detail</th>
          <th className="p-4 border-b">Refund Amount</th>
          <th className="p-4 border-b text-right">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {cancelledRefunds.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50 transition">
            <td className="p-4">
              <div className="font-bold text-gray-800">#{item.Order?.id}</div>
              <div className="text-sm text-gray-500">
                Item: {item.productId} (x{item.quantity})
              </div>
              <div className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded w-fit mt-1 font-bold">
                Cancelled (Prepaid)
              </div>
            </td>
            <td className="p-4 font-bold text-gray-800">
              ₹{(parseFloat(item.price) * item.quantity).toLocaleString()}
            </td>
            <td className="p-4 text-right">
              <button
                onClick={() =>
                  setSelectedForRefund({
                    orderId: item.Order.id,
                    itemId: item.id,
                    amountToRefund: parseFloat(item.price) * item.quantity,
                    customerName: "Customer",
                  })
                }
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-md text-sm flex items-center gap-2 ml-auto"
              >
                <FaWallet /> Process Refund
              </button>
            </td>
          </tr>
        ))}
        {cancelledRefunds.length === 0 && (
          <tr>
            <td colSpan="3" className="p-8 text-center text-gray-400">
              No pending prepaid refunds.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaBoxOpen className="text-blue-600" /> Returns & Refunds
        </h1>

        {/* 🟢 TABS SWITCHER */}
        <div className="bg-white p-1 rounded-lg border border-gray-200 flex shadow-sm">
          <button
            onClick={() => setActiveTab("returns")}
            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition ${
              activeTab === "returns"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <FaExchangeAlt /> Return Requests
          </button>
          <button
            onClick={() => setActiveTab("refunds")}
            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition ${
              activeTab === "refunds"
                ? "bg-red-100 text-red-700"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <FaMoneyBillWave /> Prepaid Cancellations
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : activeTab === "refunds" ? (
          renderCancelledTable()
        ) : (
          // --- EXISTING RETURNS TABLE ---
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
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
                  <td className="p-4 align-top">
                    <div className="flex flex-col gap-2">
                      <span className="font-bold text-gray-800 text-lg">
                        #{req.orderId}
                      </span>
                      <Link
                        to={`/admin/orders/${req.orderId}`}
                        className="text-blue-600 hover:underline text-sm font-bold flex items-center gap-1"
                      >
                        View Order <FaExternalLinkAlt size={10} />
                      </Link>
                      <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit font-bold">
                        Refund: ₹{req.amountToRefund}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 max-w-xs align-top">
                    <div className="font-medium">{req.customerName}</div>
                    <div className="text-sm text-gray-500">
                      {req.customerPhone}
                    </div>
                    <div className="mt-2 text-sm bg-red-50 text-red-700 p-2 rounded border border-red-100 italic">
                      "{req.reason}"
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    {req.status === "REQUESTED" && (
                      <span className="text-gray-400 italic">
                        Pending Approval
                      </span>
                    )}
                    {["APPROVED", "PICKUP_SCHEDULED"].includes(req.status) && (
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-gray-500">
                          <FaTruck className="inline" /> {req.pickupBoy}
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
                        At Warehouse
                      </span>
                    )}
                    {req.status === "COMPLETED" && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-bold">
                        Verified
                      </span>
                    )}
                    {(req.status === "REFUNDED" ||
                      req.status === "CREDITED") && (
                      <span className="text-green-600 font-bold flex items-center gap-1">
                        <FaWallet /> Credited
                      </span>
                    )}
                    {req.status === "REJECTED" && (
                      <span className="text-red-500 font-bold flex items-center gap-1">
                        Rejected
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right align-top">
                    {req.status === "REQUESTED" && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            handleAction(req.orderId, req.itemId, "APPROVED")
                          }
                          className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleAction(req.orderId, req.itemId, "REJECTED")
                          }
                          className="px-3 py-1.5 border border-red-200 text-red-600 rounded text-xs font-bold hover:bg-red-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {["APPROVED", "PICKUP_SCHEDULED"].includes(req.status) && (
                      <button
                        onClick={() => handleOpenReassign(req)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold ml-auto block hover:bg-blue-700"
                      >
                        Reassign
                      </button>
                    )}
                    {req.status === "RETURNED" && (
                      <button
                        onClick={() =>
                          handleAction(req.orderId, req.itemId, "COMPLETED")
                        }
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-bold ml-auto block hover:bg-indigo-700"
                      >
                        Verify Item
                      </button>
                    )}
                    {req.status === "COMPLETED" && (
                      <button
                        onClick={() => setSelectedForRefund(req)}
                        className="px-4 py-2 bg-purple-600 text-white rounded text-xs font-bold shadow-md ml-auto block hover:bg-purple-700"
                      >
                        Create Credit Note
                      </button>
                    )}
                    {(req.status === "REFUNDED" ||
                      req.status === "CREDITED") && (
                      <button
                        onClick={() => setSelectedCreditNote(req)}
                        className="text-xs text-purple-600 font-bold hover:underline bg-purple-50 px-2 py-1 rounded ml-auto block"
                      >
                        View Credit Note
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* 1. Refund Confirmation */}
      {selectedForRefund && (
        <RefundModal
          request={selectedForRefund}
          onClose={() => setSelectedForRefund(null)}
          onConfirm={(orderId, itemId) =>
            handleAction(orderId, itemId, "CREDITED")
          }
        />
      )}

      {/* 2. Credit Note View */}
      {selectedCreditNote && (
        <CreditNoteModal
          data={selectedCreditNote}
          onClose={() => setSelectedCreditNote(null)}
        />
      )}

      {/* 3. Reassign Driver */}
      <ReassignmentModal
        isOpen={reassignModalOpen}
        onClose={() => setReassignModalOpen(false)}
        loading={reassignLoading}
        options={reassignOptions}
        selectedBoy={selectedNewBoy}
        onSelectBoy={setSelectedNewBoy}
        onConfirm={handleConfirmReassign}
      />
    </div>
  );
};

export default AdminReturnRequests;
