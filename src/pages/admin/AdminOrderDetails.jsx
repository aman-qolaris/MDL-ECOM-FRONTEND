import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getAdminOrderDetails,
  updateOrderStatus,
} from "../../services/orderService";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaTruck,
  FaUserClock,
  FaBox,
} from "react-icons/fa";

// Mock Data for Delivery Boys (Replace with real API call later)
const MOCK_DELIVERY_BOYS = [
  { id: 101, name: "Rahul Kumar", status: "Available", activeOrders: 0 },
  { id: 102, name: "Amit Singh", status: "Busy", activeOrders: 2 },
  { id: 103, name: "Vikram Roy", status: "Available", activeOrders: 0 },
];

const AdminOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const data = await getAdminOrderDetails(id);
      setOrder(data);
      // If order already has a driver assigned, set it
      if (data.deliveryBoyId) setSelectedDriver(data.deliveryBoyId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Toggle Item Ready Status
  const toggleItemReady = (index) => {
    const updatedItems = [...order.OrderItems];
    const currentStatus = updatedItems[index].status;
    // Toggle logic: If "PACKED" -> make "PENDING", else make "PACKED"
    updatedItems[index].status =
      currentStatus === "PACKED" ? "PENDING" : "PACKED";

    // Update local state immediately (Optimistic UI)
    setOrder({ ...order, OrderItems: updatedItems });

    // TODO: Call API here: updateOrderItemStatus(updatedItems[index].id, updatedItems[index].status)
  };

  // 2. Check Dispatch Eligibility
  const areAllItemsReady = order?.OrderItems?.every(
    (item) => item.status === "PACKED"
  );
  const isCod = order?.paymentMethod === "COD";

  // Dispatch Button Logic
  const handleDispatch = async () => {
    if (!areAllItemsReady) return;

    if (isCod && !selectedDriver) {
      alert(
        "⚠️ Action Required: COD Orders require an active Delivery Boy assignment before dispatch."
      );
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to mark this order as OUT FOR DELIVERY?"
      )
    ) {
      try {
        await updateOrderStatus(order.id, "Out for Delivery");
        setOrder({ ...order, status: "Out for Delivery" });
        alert("Order Dispatched Successfully!");
      } catch (e) {
        alert("Failed to update status");
      }
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading Order Details...</div>;
  if (!order)
    return <div className="p-8 text-center text-red-500">Order Not Found</div>;

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/admin/orders"
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition font-medium"
        >
          <FaArrowLeft /> Back to List
        </Link>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-gray-800">
            Order #{order.id}
          </h1>
          <span className="text-sm text-gray-500">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION 1: ORDER BREAKDOWN (Takes 2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <FaBox className="text-blue-500" /> Order Breakdown
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  areAllItemsReady
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {areAllItemsReady
                  ? "All Items Ready"
                  : "Preparation in Progress"}
              </span>
            </div>

            <div className="p-6 space-y-4">
              {order.OrderItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-4 rounded-lg border transition ${
                    item.status === "PACKED"
                      ? "bg-green-50 border-green-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {/* Product Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-xs font-bold text-gray-500">
                      IMG
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">
                        Product ID: {item.productId}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Fulfillment:{" "}
                        <span className="font-semibold text-blue-600">
                          {item.vendorId
                            ? `Vendor #${item.vendorId}`
                            : "Admin Store"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Price & Toggle */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-bold text-gray-800">₹{item.price}</p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    {/* Ready Toggle */}
                    <button
                      onClick={() => toggleItemReady(idx)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition ${
                        item.status === "PACKED"
                          ? "bg-green-600 text-white shadow-green-200 hover:bg-green-700"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {item.status === "PACKED" ? (
                        <>
                          <FaCheckCircle /> Ready
                        </>
                      ) : (
                        "Mark Ready"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Dispatch Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                * Mark all items as ready to enable dispatch.
              </div>
              <button
                onClick={handleDispatch}
                disabled={
                  !areAllItemsReady || order.status === "Out for Delivery"
                }
                className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition ${
                  !areAllItemsReady || order.status === "Out for Delivery"
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
                }`}
              >
                <FaTruck />{" "}
                {order.status === "Out for Delivery"
                  ? "Dispatched"
                  : "Mark Out for Delivery"}
              </button>
            </div>
          </div>

          {/* Price Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-700 mb-4">Price Details</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.amount}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (GST)</span>
                <span>₹0.00</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg text-gray-800">
                <span>Total Amount</span>
                <span>₹{order.amount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: DELIVERY & CUSTOMER (Right Column) */}
        <div className="space-y-6">
          {/* Delivery Assignment Card */}
          <div
            className={`bg-white rounded-xl shadow-sm border p-6 ${
              isCod && !selectedDriver
                ? "border-red-300 ring-4 ring-red-50"
                : "border-gray-200"
            }`}
          >
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <FaUserClock className="text-orange-500" /> Delivery Assignment
            </h3>

            {isCod && (
              <div className="mb-4 bg-red-50 text-red-700 text-xs p-3 rounded border border-red-100 font-medium">
                ⚠️ COD Payment: Active Delivery Boy required.
              </div>
            )}

            <div className="space-y-3">
              {MOCK_DELIVERY_BOYS.map((boy) => (
                <div
                  key={boy.id}
                  onClick={() => setSelectedDriver(boy.id)}
                  className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition ${
                    selectedDriver === boy.id
                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                      {boy.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {boy.name}
                      </p>
                      <p className="text-xs text-gray-500">{boy.status}</p>
                    </div>
                  </div>
                  {selectedDriver === boy.id && (
                    <FaCheckCircle className="text-blue-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-700 mb-4">Customer Details</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-bold text-gray-800 text-base">
                {order.address?.name || "Guest"}
              </p>
              <p>{order.address?.street}</p>
              <p>
                {order.address?.city}, {order.address?.state} -{" "}
                {order.address?.zip}
              </p>
              <p className="pt-2 font-mono text-gray-500">
                Ph: {order.address?.phone}
              </p>
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-700 mb-2">Payment Info</h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Method</span>
              <span className="font-bold text-gray-800">
                {order.paymentMethod}
              </span>
            </div>
            <div className="mt-4">
              <span
                className={`block text-center py-2 rounded font-bold text-sm ${
                  order.payment
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {order.payment ? "PAID" : "PENDING"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
