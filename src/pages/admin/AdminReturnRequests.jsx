import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaBoxOpen,
  FaCheck,
  FaTruck,
  FaWallet,
  FaExternalLinkAlt,
  FaExchangeAlt,
  FaMoneyBillWave,
  FaArrowLeft,
  FaCalendarAlt,
  FaBox,
} from "react-icons/fa";

import RefundModal from "../../components/admin/returns/RefundModal";
import ReassignmentModal from "../../components/admin/orders/details/ReassignmentModal";
import CreditNoteModal from "../../components/admin/returns/CreditNoteModal";

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
  const [searchParams, setSearchParams] = useSearchParams();

  // --- STATE ---
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "returns",
  );

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedForRefund, setSelectedForRefund] = useState(null);
  const [selectedCreditNote, setSelectedCreditNote] = useState(null);

  // Reassignment State
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignOptions, setReassignOptions] = useState([]);
  const [reassignLoading, setReassignLoading] = useState(false);
  const [targetReturn, setTargetReturn] = useState(null);
  const [selectedNewBoy, setSelectedNewBoy] = useState(null);

  // Handle Tab Change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // 🟢 FETCH DATA (Simple, No Pagination, Explicit De-duplication)
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let data;
      // Fetch all (pass high limit to disable backend pagination if needed)
      if (activeTab === "returns") {
        data = await getAllReturnRequests(1, 10000);
      } else {
        data = await getCancelledRefundOrders(1, 10000);
      }

      // 🟢 FIX: Explicit De-duplication on Frontend
      // This ensures that even if the API sends duplicates, the UI won't show them.
      const uniqueItems = [];
      const seenIds = new Set();
      const idKey = activeTab === "returns" ? "itemId" : "id";

      if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item) => {
          if (!seenIds.has(item[idKey])) {
            seenIds.add(item[idKey]);
            uniqueItems.push(item);
          }
        });
      }

      setItems(uniqueItems);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredItems = useMemo(() => {
    if (!dateRange.start && !dateRange.end) return items;

    const start = dateRange.start
      ? new Date(dateRange.start)
      : new Date("2000-01-01");
    const end = dateRange.end ? new Date(dateRange.end) : new Date();
    end.setHours(23, 59, 59, 999);

    return items.filter((item) => {
      const itemDate = new Date(
        item.createdAt || item.updatedAt || item.lastUpdated,
      );
      return itemDate >= start && itemDate <= end;
    });
  }, [items, dateRange]);

  // --- HANDLERS ---
  const handleOpenReassign = async (req) => {
    setTargetReturn(req);
    setReassignModalOpen(true);
    setReassignLoading(true);
    setSelectedNewBoy(null);

    try {
      const data = await getReassignmentOptions(req.orderId);
      setReassignOptions(data.options);
    } catch (err) {
      toast.error("Failed to load delivery boys");
      setReassignModalOpen(false);
    } finally {
      setReassignLoading(false);
    }
  };

  const handleConfirmReassign = async () => {
    if (!selectedNewBoy) return toast.warning("Please select a partner");
    try {
      await reassignDeliveryBoy(targetReturn.orderId, null, selectedNewBoy.id);
      toast.success("Delivery Partner Reassigned");
      // Local Update
      setItems((prev) =>
        prev.map((item) =>
          item.orderId === targetReturn.orderId
            ? { ...item, pickupBoy: selectedNewBoy.name }
            : item,
        ),
      );
      setReassignModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Reassignment Failed");
    }
  };

  const handleAction = async (orderId, itemId, status) => {
    if (
      status === "REJECTED" &&
      !window.confirm("Are you sure you want to REJECT?")
    )
      return;

    try {
      // 🟢 FIX: Capture response to get the assigned delivery boy
      const response = await updateReturnStatus(orderId, itemId, status);
      const newPickupBoy = response.pickupBoy; // Access the name returned by backend

      toast.success(
        status === "CREDITED"
          ? "Refund Processed Successfully!"
          : `Status updated to ${status}`,
      );
      setSelectedForRefund(null);

      // 🟢 FIX: Update Local State with the new Delivery Boy immediately
      setItems((prev) =>
        prev.map((item) => {
          const currentId = activeTab === "returns" ? item.itemId : item.id;
          if (currentId == itemId) {
            return {
              ...item,
              status: status,
              refundStatus: status,
              // If backend sent a name, use it. Otherwise keep existing (or fallback)
              pickupBoy: newPickupBoy || item.pickupBoy,
            };
          }
          return item;
        }),
      );
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  // --- RENDER HELPERS ---
  const renderCancelledTable = () => (
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
        {filteredItems.map((item, index) => (
          <tr key={item.id || index} className="hover:bg-gray-50 transition">
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
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
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
                  onClick={() =>
                    setSelectedCreditNote({
                      itemId: item.id,
                      orderId: item.orderId || item.Order?.id,
                      productName: item.Product?.name,
                      quantity: item.quantity,
                      amountToRefund: parseFloat(item.price) * item.quantity,
                      reason: item.returnReason || "Cancellation",
                      status: "CREDITED",
                      customerName: item.Order?.address?.fullName || "Customer",
                      customerPhone: item.Order?.address?.phone || "N/A",
                    })
                  }
                  className="text-xs text-purple-600 font-bold hover:underline bg-purple-50 px-2 py-1 rounded ml-auto block"
                >
                  View Refund Details
                </button>
              ) : (
                <button
                  onClick={() =>
                    setSelectedForRefund({
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
        ))}
      </tbody>
    </table>
  );

  const renderReturnsTable = () => (
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
        {filteredItems.map((req, index) => (
          <tr key={req.itemId || index} className="hover:bg-gray-50 transition">
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
                <span className="font-bold text-gray-800">#{req.orderId}</span>
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
                    {/* Display the assigned name immediately */}
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
                  Process Refund
                </button>
              )}
              {(req.status === "REFUNDED" || req.status === "CREDITED") && (
                <button
                  onClick={() => setSelectedCreditNote(req)}
                  className="text-xs text-purple-600 font-bold hover:underline bg-purple-50 px-2 py-1 rounded ml-auto block"
                >
                  View Refund Details
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 text-gray-600 transition shadow-sm"
            >
              <FaArrowLeft size={16} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaBoxOpen className="text-blue-600" /> Returns & Refunds
            </h1>
          </div>

          <div className="bg-white p-1 rounded-lg border border-gray-200 flex shadow-sm">
            <button
              onClick={() => handleTabChange("returns")}
              className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition ${
                activeTab === "returns"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <FaExchangeAlt /> Returns
            </button>
            <button
              onClick={() => handleTabChange("refunds")}
              className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition ${
                activeTab === "refunds"
                  ? "bg-red-100 text-red-700"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <FaMoneyBillWave /> Cancellations
            </button>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
            <FaCalendarAlt /> Filter Date:
          </div>
          <input
            type="date"
            className="border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 text-gray-700"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, start: e.target.value }))
            }
          />
          <span className="text-gray-400">-</span>
          <input
            type="date"
            className="border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 text-gray-700"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, end: e.target.value }))
            }
          />
          {(dateRange.start || dateRange.end) && (
            <button
              onClick={() => setDateRange({ start: "", end: "" })}
              className="text-xs text-red-600 hover:text-red-800 font-bold ml-auto"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading...</div>
        ) : activeTab === "refunds" ? (
          renderCancelledTable()
        ) : (
          renderReturnsTable()
        )}
      </div>

      {selectedForRefund && (
        <RefundModal
          request={selectedForRefund}
          onClose={() => setSelectedForRefund(null)}
          onConfirm={(orderId, itemId) =>
            handleAction(orderId, itemId, "CREDITED")
          }
        />
      )}

      {selectedCreditNote && (
        <CreditNoteModal
          data={selectedCreditNote}
          onClose={() => setSelectedCreditNote(null)}
        />
      )}

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
