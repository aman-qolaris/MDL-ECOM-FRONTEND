import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getAdminOrderDetails,
  updateOrderStatus,
  getAllDeliveryBoys,
  assignDeliveryBoy,
  reassignDeliveryBoy,
  getAllVendors,
  updateOrderItemStatus,
} from "../../services/orderService";
import { getProductById } from "../../services/productService";
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
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState({});

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

  // ✅ FIX 1: Use 'businessName' to match your Vendor Model
  const getVendorShopName = (vendorId) => {
    if (!vendorId) return "Admin Store";
    const vendor = vendors.find((v) => v.id === vendorId);
    return vendor ? vendor.businessName : `Vendor #${vendorId}`;
  };

  // Logic: Toggle Item Ready
  const toggleItemReady = async (index) => {
    const item = order.OrderItems[index];

    if (item.vendorId !== null) {
      alert("Only the Vendor can mark their items as Packed.");
      return;
    }

    const newStatus = item.status === "PACKED" ? "PENDING" : "PACKED";

    try {
      const updatedItems = [...order.OrderItems];
      updatedItems[index].status = newStatus;
      setOrder({ ...order, OrderItems: updatedItems });
      await updateOrderItemStatus(item.id, newStatus);
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
      fetchData();
    }
  };

  const areAllItemsReady = order?.OrderItems?.every(
    (item) => item.status === "PACKED"
  );
  const isCod = order?.paymentMethod === "COD";

  const handleDispatch = async () => {
    if (!areAllItemsReady) return;

    if (isCod && !selectedDriver) {
      alert(
        "⚠️ Action Required: COD Orders require an active Delivery Boy assignment."
      );
      return;
    }

    if (window.confirm("Mark this order as OUT FOR DELIVERY?")) {
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
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
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
                  <div className="flex items-center gap-4">
                    {/* ✅ FIX 2: Use .imageUrl directly (Minio returns full URL) */}
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border border-gray-200">
                      {products[item.productId]?.imageUrl ? (
                        <img
                          src={products[item.productId].imageUrl}
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

                      {/* ✅ FIX 1 Applied: Shows businessName */}
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <FaStore className="text-gray-400" />
                        Fulfillment:{" "}
                        <span className="font-semibold text-blue-600">
                          {getVendorShopName(item.vendorId)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-bold text-gray-800">₹{item.price}</p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    {item.vendorId === null ? (
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

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-700 mb-4">Price Details</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.amount}</span>
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

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
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

            {order && order.deliveryBoyId && (
              <div className="mb-4 pb-4 border-b border-gray-100">
                <button
                  onClick={handleReassign}
                  className="w-full py-2 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg text-sm font-bold hover:bg-orange-100 transition flex justify-center items-center gap-2"
                >
                  <FaUserClock /> Reassign Selected Driver
                </button>
              </div>
            )}

            {isCod && (
              <div className="mb-4 bg-red-50 text-red-700 text-xs p-3 rounded border border-red-100 font-medium">
                ⚠️ COD Payment: Active Delivery Boy required.
              </div>
            )}

            {/*Drop down for delivery boys */}
            <div className="relative">
              <select
                value={selectedDriver || ""}
                onChange={(e) => setSelectedDriver(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-gray-700 font-medium cursor-pointer"
              >
                <option value="" disabled>
                  -- Select Delivery Boy --
                </option>
                {deliveryBoys.map((boy) => (
                  <option
                    key={boy.id}
                    value={boy.id}
                    disabled={!boy.active}
                    className="py-2"
                  >
                    {boy.name} {boy.active ? "(Available)" : "(Unavailable)"}
                  </option>
                ))}
              </select>

              {/* Dropdown Arrow Icon Overlay */}
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>

            {/* Show Selected Driver Details below dropdown if needed */}
            {selectedDriver && (
              <div className="mt-3 text-sm text-green-600 font-medium flex items-center gap-2">
                <FaCheckCircle /> Driver Selected
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-700 mb-4">Customer Details</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-bold text-gray-800 text-base">
                {order.address?.fullName || "Guest"}
              </p>
              <p>{order.address?.addressLine1}</p>
              <p>
                {order.address?.city}, {order.address?.state} -{" "}
                {order.address?.zipCode}
              </p>
              <p className="pt-2 font-mono text-gray-500">
                Ph: {order.address?.phone}
              </p>
            </div>
          </div>

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
