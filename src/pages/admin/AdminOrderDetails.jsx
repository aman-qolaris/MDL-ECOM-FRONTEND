import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getAdminOrderDetails,
  updateOrderStatus,
  getAllDeliveryBoys,
  assignDeliveryBoy,
  reassignDeliveryBoy,
  getAllVendors, // 👈 Imported
  updateOrderItemStatus, // 👈 Imported
} from "../../services/orderService";
import { getProductById } from "../../services/productService"; // 👈 Import this
import {
  FaArrowLeft,
  FaCheckCircle,
  FaTruck,
  FaUserClock,
  FaBox,
  FaStore,
} from "react-icons/fa";

const AdminOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data States
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [vendors, setVendors] = useState([]); // 👈 Store vendors
  const [products, setProducts] = useState({}); // 👈 Store product details (images)

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Fetch Order, Delivery Boys, and Vendors
      const [orderData, boysData, vendorsData] = await Promise.all([
        getAdminOrderDetails(id),
        getAllDeliveryBoys(),
        getAllVendors(),
      ]);

      setOrder(orderData);
      setDeliveryBoys(boysData);
      setVendors(vendorsData);

      if (orderData.deliveryBoyId) {
        setSelectedDriver(orderData.deliveryBoyId);
      }

      // 2. Fetch Product Details (Images/Names) for all items
      const productMap = {};
      const productPromises = orderData.OrderItems.map(async (item) => {
        try {
          const product = await getProductById(item.productId);
          productMap[item.productId] = product;
        } catch (e) {
          console.error(`Failed to fetch product ${item.productId}`);
        }
      });
      await Promise.all(productPromises);
      setProducts(productMap);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Get Shop Name
  const getVendorShopName = (vendorId) => {
    if (!vendorId) return "Admin Store";
    const vendor = vendors.find((v) => v.id === vendorId);
    return vendor ? vendor.shopName : `Vendor #${vendorId}`;
  };

  // Logic: Toggle Item Ready (Connects to Backend)
  const toggleItemReady = async (index) => {
    const item = order.OrderItems[index];

    // Restrict Admin from packing Vendor items
    if (item.vendorId !== null) {
      alert("Only the Vendor can mark their items as Packed.");
      return;
    }

    const newStatus = item.status === "PACKED" ? "PENDING" : "PACKED";

    try {
      // Optimistic Update
      const updatedItems = [...order.OrderItems];
      updatedItems[index].status = newStatus;
      setOrder({ ...order, OrderItems: updatedItems });

      // API Call
      await updateOrderItemStatus(item.id, newStatus);
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
      fetchData(); // Revert on error
    }
  };

  // Check Dispatch Eligibility
  const areAllItemsReady = order?.OrderItems?.every(
    (item) => item.status === "PACKED"
  );
  const isCod = order?.paymentMethod === "COD";

  // Dispatch Logic
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
        if (selectedDriver && !order.deliveryBoyId) {
          await assignDeliveryBoy(order.id, selectedDriver);
        }
        await updateOrderStatus(order.id, "Out for Delivery");
        setOrder({ ...order, status: "Out for Delivery" });
        alert("Order Dispatched Successfully!");
      } catch (e) {
        console.error(e);
        alert("Failed to update status or assign driver");
      }
    }
  };

  // Reassign Logic
  const handleReassign = async () => {
    if (!order.deliveryBoyId) {
      alert(
        "No driver is currently assigned. Just select one and click Dispatch."
      );
      return;
    }
    if (selectedDriver === order.deliveryBoyId) {
      alert("Please select a DIFFERENT driver from the list below first.");
      return;
    }

    const reason = prompt("Enter reason for reassignment (e.g., Driver busy):");
    if (!reason) return;

    try {
      await reassignDeliveryBoy(
        order.id,
        order.deliveryBoyId,
        selectedDriver,
        reason
      );
      alert("Delivery Boy Reassigned Successfully!");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to reassign driver");
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
                  {/* Product Info with Image */}
                  <div className="flex items-center gap-4">
                    {/* 👇 Updated Image Logic */}
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border border-gray-200">
                      {products[item.productId]?.image ? (
                        <img
                          src={`http://localhost:5007${
                            products[item.productId].image
                          }`} // Adjust host if needed
                          alt="Product"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-gray-400">
                          IMG
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="font-bold text-gray-800">
                        {products[item.productId]?.name ||
                          `Product ID: ${item.productId}`}
                      </p>

                      {/* 👇 Updated Shop Name Display */}
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <FaStore className="text-gray-400" />
                        Fulfillment:{" "}
                        <span className="font-semibold text-blue-600">
                          {getVendorShopName(item.vendorId)}
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
                    {item.vendorId === null ? (
                      // Admin Item: Allow Toggle
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
                    ) : (
                      // Vendor Item: Read Only Badge
                      <span
                        className={`px-3 py-2 rounded-lg text-xs font-bold border ${
                          item.status === "PACKED"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-yellow-50 text-yellow-600 border-yellow-200"
                        }`}
                      >
                        {item.status === "PACKED"
                          ? "Packed by Vendor"
                          : "Pending Vendor"}
                      </span>
                    )}
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

            {/* REASSIGN BUTTON BLOCK */}
            {order && order.deliveryBoyId && (
              <div className="mb-4 pb-4 border-b border-gray-100">
                <button
                  onClick={handleReassign}
                  className="w-full py-2 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg text-sm font-bold hover:bg-orange-100 transition flex justify-center items-center gap-2"
                >
                  <FaUserClock /> Reassign Selected Driver
                </button>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  * To change: Select a new driver from the list below, then
                  click above.
                </p>
              </div>
            )}

            {isCod && (
              <div className="mb-4 bg-red-50 text-red-700 text-xs p-3 rounded border border-red-100 font-medium">
                ⚠️ COD Payment: Active Delivery Boy required.
              </div>
            )}

            {/* Delivery Boys List */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {deliveryBoys.length > 0 ? (
                deliveryBoys.map((boy) => (
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
                        <p
                          className={`text-xs ${
                            boy.active ? "text-green-600" : "text-gray-400"
                          }`}
                        >
                          {boy.active ? "Available" : "Unavailable"}
                        </p>
                      </div>
                    </div>
                    {selectedDriver === boy.id && (
                      <FaCheckCircle className="text-blue-500" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-gray-400 py-4">
                  No delivery boys found
                </p>
              )}
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
