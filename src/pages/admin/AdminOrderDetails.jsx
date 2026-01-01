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
  FaUser,
  FaStore,
  FaMapMarkerAlt,
  FaPhone,
  FaBoxOpen,
  FaClipboardList,
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

      // Fetch Product Details
      const productMap = {};
      const productPromises = orderData.OrderItems.map(async (item) => {
        try {
          if (!productMap[item.productId]) {
            const product = await getProductById(item.productId);
            productMap[item.productId] = product;
          }
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

  // --- Helpers ---
  const getVendorDetails = (vendorId) => {
    if (!vendorId)
      return {
        name: "Admin Inventory",
        phone: "N/A",
        businessName: "Admin Store",
      };
    const vendor = vendors.find((v) => v.id === vendorId);
    return (
      vendor || {
        name: "Unknown",
        phone: "N/A",
        businessName: "Unknown Vendor",
      }
    );
  };

  const getDriverDetails = (driverId) => {
    if (!driverId) return null;
    return deliveryBoys.find((b) => b.id === driverId);
  };

  // --- Actions ---
  const toggleItemReady = async (item, index) => {
    if (item.vendorId !== null) {
      alert("Only the Vendor can mark their items as Packed.");
      return;
    }
    const newStatus = item.status === "PACKED" ? "PENDING" : "PACKED";

    // 1. Optimistic UI Update (Immediate feedback)
    const updatedItems = [...order.OrderItems];
    updatedItems[index].status = newStatus;

    // Check if ALL items are now packed
    const allPackedNow = updatedItems.every((i) => i.status === "PACKED");

    setOrder({
      ...order,
      OrderItems: updatedItems,
      // Optional: Update top-level status visually if needed,
      // but the "Dynamic Step Logic" below handles the progress bar automatically.
    });

    try {
      await updateOrderItemStatus(item.id, newStatus);
    } catch (err) {
      console.error(err);
      fetchData(); // Revert on error
    }
  };

  const handleDispatch = async () => {
    const areAllItemsReady = order?.OrderItems?.every(
      (item) => item.status === "PACKED"
    );
    if (!areAllItemsReady) return;

    if (window.confirm("Mark this order as OUT FOR DELIVERY?")) {
      try {
        if (selectedDriver && !order.deliveryBoyId) {
          await assignDeliveryBoy(order.id, selectedDriver);
        }
        await updateOrderStatus(order.id, "Out for Delivery");
        setOrder({ ...order, status: "Out for Delivery" });
        alert("Order Dispatched Successfully!");
      } catch (e) {
        alert("Failed to update status");
      }
    }
  };

  const handleReassign = async () => {
    if (!order.deliveryBoyId || selectedDriver === order.deliveryBoyId) return;
    const reason = prompt("Reason for reassignment:");
    if (!reason) return;

    try {
      await reassignDeliveryBoy(
        order.id,
        order.deliveryBoyId,
        selectedDriver,
        reason
      );
      alert("Reassigned Successfully!");
      fetchData();
    } catch (err) {
      alert("Failed to reassign");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!order)
    return <div className="p-8 text-center text-red-500">Not Found</div>;

  const currentDriver = getDriverDetails(order.deliveryBoyId);

  // Check if ALL items are packed (used for Dispatch Button & Progress Bar)
  const areAllItemsReady = order.OrderItems.every(
    (item) => item.status === "PACKED"
  );

  // --- ⚡ SMART PROGRESS BAR LOGIC ---
  const steps = ["Pending", "PACKED", "Out for Delivery", "Delivered"];

  let currentStepIndex = 0;
  if (order.status === "Delivered") {
    currentStepIndex = 3;
  } else if (order.status === "Out for Delivery") {
    currentStepIndex = 2;
  } else if (order.status === "PACKED") {
    currentStepIndex = 1;
  } else if (order.status === "Pending" && areAllItemsReady) {
    // 🟢 FIX: If DB says "Pending" but items are ready, show Step 1 (Packed)
    currentStepIndex = 1;
  } else {
    currentStepIndex = 0;
  }

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto pb-10">
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between mb-8">
        <Link
          to="/admin/orders"
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition font-medium"
        >
          <FaArrowLeft /> Back to Orders
        </Link>
        <div className="text-right">
          <h1 className="text-3xl font-bold text-gray-800">
            Order #{order.id}
          </h1>
          <p className="text-gray-500">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* --- 1. VISUAL FLOW (Lifecycle) --- */}
      <div className="mb-8 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">
          Order Journey
        </h3>
        <div className="flex items-center justify-between relative">
          {/* Progress Bar Background */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-0"></div>
          {/* Progress Bar Fill */}
          <div
            className="absolute top-1/2 left-0 h-1 bg-green-500 -z-0 transition-all duration-500"
            style={{
              width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
            }}
          ></div>

          {/* Steps */}
          {steps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div
                key={step}
                className="relative z-10 flex flex-col items-center gap-2 bg-white px-2"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                    isCompleted
                      ? "bg-green-500 text-white shadow-lg shadow-green-200"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {index === 0 && <FaClipboardList />}
                  {index === 1 && <FaBoxOpen />}
                  {index === 2 && <FaTruck />}
                  {index === 3 && <FaCheckCircle />}
                </div>
                <span
                  className={`text-xs font-bold ${
                    isCurrent ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {step === "PACKED" ? "Packed / Ready" : step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- 2. THE ACTORS (User - Vendor - Delivery) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* CARD A: USER (Customer) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 text-6xl text-blue-500">
            <FaUser />
          </div>
          <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> 1.
            Customer Details
          </h3>
          <div className="space-y-3">
            <p className="text-xl font-bold text-gray-800">
              {order.address?.fullName || "Guest User"}
            </p>
            <div className="flex items-start gap-3 text-gray-600 text-sm">
              <FaMapMarkerAlt className="mt-1 text-gray-400 shrink-0" />
              <p>
                {order.address?.addressLine1}
                <br />
                {order.address?.city}, {order.address?.state} -{" "}
                {order.address?.zipCode}
              </p>
            </div>
            <div className="flex items-center gap-3 text-gray-600 text-sm">
              <FaPhone className="text-gray-400" />
              <p>{order.address?.phone || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* CARD B: VENDOR (Fulfillment) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 text-6xl text-purple-500">
            <FaStore />
          </div>
          <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span> 2.
            Fulfillment Source
          </h3>

          {/* Unique Vendors List */}
          <div className="space-y-4 max-h-40 overflow-y-auto">
            {Array.from(new Set(order.OrderItems.map((i) => i.vendorId))).map(
              (vId, idx) => {
                const vendor = getVendorDetails(vId);
                return (
                  <div
                    key={idx}
                    className="border-b border-gray-100 last:border-0 pb-2 last:pb-0"
                  >
                    <p className="font-bold text-gray-800 text-sm">
                      {vendor.businessName}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <FaUser className="text-[10px]" /> {vendor.name}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <FaPhone className="text-[10px]" /> {vendor.phone}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* CARD C: DELIVERY BOY (Logistics) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 text-6xl text-orange-500">
            <FaTruck />
          </div>
          <h3 className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span> 3.
            Delivery Partner
          </h3>

          <div className="space-y-4">
            {currentDriver ? (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <p className="font-bold text-gray-800 text-lg">
                  {currentDriver.name}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                  <FaPhone className="text-orange-400" />{" "}
                  {currentDriver.phone || "No Phone"}
                </p>
                <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                  Active & Assigned
                </span>
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg text-center">
                No Driver Assigned Yet.
              </div>
            )}

            {/* Assignment Controls */}
            <div className="pt-2">
              <select
                value={selectedDriver || ""}
                onChange={(e) => setSelectedDriver(Number(e.target.value))}
                className="w-full text-sm border-gray-300 rounded-md shadow-sm mb-2 p-2 border"
              >
                <option value="">-- Select / Change Driver --</option>
                {deliveryBoys.map((boy) => (
                  <option key={boy.id} value={boy.id} disabled={!boy.active}>
                    {boy.name} {boy.active ? "" : "(Busy)"}
                  </option>
                ))}
              </select>

              {currentDriver && selectedDriver !== currentDriver.id && (
                <button
                  onClick={handleReassign}
                  className="w-full bg-orange-100 text-orange-700 text-xs font-bold py-2 rounded hover:bg-orange-200"
                >
                  Confirm Reassign
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- 3. ITEMS (Grouped by Vendor) --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <FaBoxOpen className="text-blue-500" /> Product Details
          </h3>
          <button
            onClick={handleDispatch}
            disabled={!areAllItemsReady || order.status === "Out for Delivery"}
            className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 text-sm transition ${
              !areAllItemsReady || order.status === "Out for Delivery"
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
            }`}
          >
            <FaTruck />{" "}
            {order.status === "Out for Delivery"
              ? "Dispatched"
              : "Dispatch Order"}
          </button>
        </div>

        <div className="p-6">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Vendor (Source)</th>
                <th className="px-4 py-3 text-center">Price</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.OrderItems.map((item, idx) => {
                const vendor = getVendorDetails(item.vendorId);
                const product = products[item.productId];
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={product?.imageUrl || ""}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">
                          {product?.name || `Item #${item.productId}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-100">
                        {vendor.businessName}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-gray-700">
                      ₹{item.price}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-bold ${
                          item.status === "PACKED"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {item.vendorId === null ? (
                        <button
                          onClick={() => toggleItemReady(item, idx)}
                          className="text-xs text-blue-600 hover:underline font-medium"
                        >
                          {item.status === "PACKED" ? "Undo" : "Mark Ready"}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          Managed by Vendor
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end text-lg font-bold text-gray-800">
            Total Amount: ₹{order.amount}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
