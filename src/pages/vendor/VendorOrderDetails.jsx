import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getVendorOrderDetails,
  updateVendorItemStatus,
  vendorUpdateOrderStatus,
  getVendorDeliveryBoys,
  vendorAssignDeliveryBoy,
} from "../../services/orderService";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaTruck,
  FaBox,
  FaMapMarkerAlt,
  FaUser,
} from "react-icons/fa";

const VendorOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orderData, boysData] = await Promise.all([
        getVendorOrderDetails(id),
        getVendorDeliveryBoys(),
      ]);
      setOrder(orderData);
      setDeliveryBoys(boysData);

      // Pre-select driver if already assigned
      if (orderData.deliveryBoyId) {
        setSelectedDriver(orderData.deliveryBoyId);
      }
    } catch (err) {
      console.error("Error fetching details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkItemPacked = async (itemId, index) => {
    try {
      // Optimistic Update
      const updatedItems = [...order.OrderItems];
      updatedItems[index].status = "PACKED";
      setOrder({ ...order, OrderItems: updatedItems });

      await updateVendorItemStatus(itemId, "PACKED");
    } catch (error) {
      console.error("Update failed", error);
      fetchData(); // Revert on error
    }
  };

  const handleDispatch = async () => {
    if (!selectedDriver) {
      alert("Please assign a Delivery Partner before dispatching.");
      return;
    }

    if (
      window.confirm(
        "Are you sure? This will mark the order as Out for Delivery."
      )
    ) {
      try {
        // 1. Assign Driver
        if (!order.deliveryBoyId || order.deliveryBoyId !== selectedDriver) {
          await vendorAssignDeliveryBoy(order.id, selectedDriver);
        }

        // 2. Update Status
        await vendorUpdateOrderStatus(order.id, "Out for Delivery");

        // 3. Update UI
        setOrder({ ...order, status: "Out for Delivery" });
        alert("Order Dispatched Successfully!");
      } catch (error) {
        console.error("Dispatch failed", error);
        alert("Failed to dispatch order.");
      }
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading Order Details...</div>;
  if (!order)
    return <div className="p-8 text-center text-red-500">Order Not Found</div>;

  const areAllItemsPacked = order.OrderItems.every(
    (item) => item.status === "PACKED"
  );

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/vendor/orders"
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition font-medium"
        >
          <FaArrowLeft /> Back to Orders
        </Link>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-gray-800">
            Order #{order.id}
          </h1>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${
              order.status === "Out for Delivery"
                ? "bg-blue-100 text-blue-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <FaBox className="text-blue-500" /> Items to Fulfill
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {order.OrderItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-blue-100 transition bg-white"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                      {/* Assuming Product info is populated */}
                      <img
                        src={
                          item.Product?.imageUrl ||
                          "https://via.placeholder.com/150"
                        }
                        alt="Product"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">
                        {item.Product?.name || `Product ID: ${item.productId}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity} | Price: ₹{item.price}
                      </p>
                    </div>
                  </div>

                  {item.status === "PACKED" ? (
                    <span className="flex items-center gap-1 text-green-600 font-bold text-sm bg-green-50 px-3 py-1 rounded-full border border-green-100">
                      <FaCheckCircle /> Ready
                    </span>
                  ) : (
                    <button
                      onClick={() => handleMarkItemPacked(item.id, idx)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-100 transition"
                    >
                      Mark as Packed
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <FaMapMarkerAlt className="text-red-500" /> Shipping Details
            </h3>
            {order.address ? (
              <div className="text-gray-600 text-sm space-y-2">
                <p className="font-bold text-gray-800 text-base">
                  {order.address.fullName}
                </p>
                <p>{order.address.addressLine1}</p>
                <p>
                  {order.address.city}, {order.address.state} -{" "}
                  {order.address.zipCode}
                </p>
                <p className="flex items-center gap-2 pt-2 text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                    {order.address.phone}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-red-500">No Address Info Available</p>
            )}
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <FaTruck className="text-orange-500" /> Fulfillment Action
            </h3>

            {/* Delivery Boy Selection */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Assign Delivery Partner (Area Wise)
              </label>
              <div className="relative">
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(Number(e.target.value))}
                  disabled={order.status === "Out for Delivery"}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none transition"
                >
                  <option value="">-- Select Partner --</option>
                  {deliveryBoys.map((boy) => (
                    <option key={boy.id} value={boy.id} disabled={!boy.active}>
                      {boy.name} {boy.active ? " (Active)" : " (Busy)"}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                  <FaUser />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                * Select the partner responsible for the customer's area.
              </p>
            </div>

            {/* Dispatch Button */}
            <button
              onClick={handleDispatch}
              disabled={
                !areAllItemsPacked || order.status === "Out for Delivery"
              }
              className={`w-full py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition ${
                !areAllItemsPacked || order.status === "Out for Delivery"
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
              }`}
            >
              {order.status === "Out for Delivery" ? (
                <>
                  <FaCheckCircle /> Dispatched
                </>
              ) : (
                <>
                  <FaTruck /> Mark Out for Delivery
                </>
              )}
            </button>

            {!areAllItemsPacked && (
              <p className="text-xs text-center text-red-500 mt-3 font-medium bg-red-50 p-2 rounded">
                ⚠ Pack all items before dispatching.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorOrderDetails;
