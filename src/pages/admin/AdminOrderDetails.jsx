import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getAdminOrderDetails,
  updateOrderStatus,
  getAllVendors,
  updateOrderItemStatus,
  getReassignmentOptions,
  reassignDeliveryBoy,
} from "../../services/orderService";
import { getProductById } from "../../services/productService";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaBox,
  FaStore,
  FaMoneyBillWave,
  FaWarehouse,
  FaUserSecret,
  FaPhone,
  FaExchangeAlt,
  FaTimes,
  FaBan,
  FaMotorcycle,
  FaClock,
} from "react-icons/fa";

const AdminOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data States
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState({});

  // Reassignment State
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [reassignOptions, setReassignOptions] = useState([]);
  const [reassignLoading, setReassignLoading] = useState(false);
  const [selectedNewBoy, setSelectedNewBoy] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const orderData = await getAdminOrderDetails(id);
      setOrder(orderData);

      try {
        const vendorsData = await getAllVendors();
        setVendors(vendorsData);
      } catch (vendorError) {
        console.warn("Failed to load vendors:", vendorError);
        setVendors([]);
      }

      if (orderData?.OrderItems) {
        await fetchProductData(orderData.OrderItems);
      }
    } catch (err) {
      console.error("Error fetching critical order data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductData = async (items) => {
    const productMap = {};
    const productPromises = items.map(async (item) => {
      try {
        const product = await getProductById(item.productId);
        productMap[item.productId] = product;
      } catch (e) {
        console.error(`Failed to fetch product ${item.productId}`);
      }
    });
    await Promise.all(productPromises);
    setProducts(productMap);
  };

  const getVendorShopName = (vendorId) => {
    if (!vendorId) return "Admin Store";
    const vendor = vendors.find((v) => v.id === vendorId);
    return vendor ? vendor.businessName : `Vendor #${vendorId}`;
  };

  // 🟢 Toggle Item Status (Only for Packing)
  const toggleItemReady = async (index) => {
    const item = order.OrderItems[index];
    const product = products[item.productId];

    // If item is already cancelled, Admin cannot change it
    if (item.status === "CANCELLED") return;

    const newStatus = item.status === "PACKED" ? "PENDING" : "PACKED";

    if (newStatus === "PACKED") {
      if (!product) {
        alert("Product data not loaded yet. Please wait.");
        return;
      }
      if (product.warehouseStock < item.quantity) {
        alert(
          `⛔ INSUFFICIENT WAREHOUSE STOCK!\n\n` +
            `Required: ${item.quantity}\n` +
            `Available in Warehouse: ${product.warehouseStock}\n\n` +
            `Please transfer stock to warehouse before packing.`
        );
        return;
      }
    }

    try {
      const updatedItems = [...order.OrderItems];
      updatedItems[index].status = newStatus;
      setOrder({ ...order, OrderItems: updatedItems });
      await updateOrderItemStatus(order.id, item.id, newStatus);
      fetchProductData(order.OrderItems);
    } catch (err) {
      console.error(err);
      alert("Failed to update status. Server might be enforcing stock limits.");
      fetchData();
    }
  };

  // 🟢 Logic: Order is ready if all items are either PACKED or CANCELLED
  const areAllItemsReady = order?.OrderItems?.every(
    (item) => item.status === "PACKED" || item.status === "CANCELLED"
  );

  // 🟢 Helper to check if order allows packing actions
  // This is the FIX: Allow actions for PROCESSING or PARTIALLY_CANCELLED
  const isPackingAllowed =
    order &&
    (order.status === "PROCESSING" || order.status === "PARTIALLY_CANCELLED");

  // 🟢 Mark Order as PACKED (Triggers Delivery Boy Assignment)
  const handleMarkPacked = async () => {
    if (!areAllItemsReady) return;
    try {
      await updateOrderStatus(order.id, "PACKED");
      await fetchData(); // Refresh to show assignment
      alert("Order Marked as PACKED. Delivery Partner Assigned.");
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  // --- Reassignment Logic (unchanged) ---
  const handleOpenReassign = async () => {
    setIsReassignModalOpen(true);
    setReassignLoading(true);
    try {
      const data = await getReassignmentOptions(order.id);
      setReassignOptions(data.options || []);
    } catch (err) {
      console.error("Failed to load reassignment options", err);
      alert("Could not load delivery boys. Please try again.");
      setIsReassignModalOpen(false);
    } finally {
      setReassignLoading(false);
    }
  };

  const handleSubmitReassignment = async () => {
    if (!selectedNewBoy) {
      alert("Please select a delivery boy.");
      return;
    }
    if (!window.confirm(`Confirm reassignment to ${selectedNewBoy.name}?`))
      return;

    try {
      await reassignDeliveryBoy(id, null, selectedNewBoy.id);
      alert("Reassignment Successful!");
      setIsReassignModalOpen(false);
      setSelectedNewBoy(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Reassignment Failed");
    }
  };

  const calculatePriceDetails = () => {
    if (!order) return { subtotal: 0, total: 0 };
    // Only calculate for non-cancelled items
    const activeItems = order.OrderItems.filter(
      (item) => item.status !== "CANCELLED"
    );
    const subtotal = activeItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    // Note: order.amount from DB might still be original total unless backend updates it on cancel
    // Ideally backend updates order.amount on cancellation, but if not, we show recalculated subtotal
    return { subtotal, total: order.amount };
  };

  const priceDetails = calculatePriceDetails();
  const assignment = order?.DeliveryAssignment;
  const deliveryBoy = assignment?.DeliveryBoy;

  if (loading)
    return <div className="p-8 text-center">Loading Order Details...</div>;
  if (!order)
    return <div className="p-8 text-center text-red-500">Order Not Found</div>;

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto pb-10 relative">
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

      {/* --- Reassignment Modal --- */}
      {isReassignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => setIsReassignModalOpen(false)}
          ></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FaExchangeAlt className="text-blue-600" /> Reassign Partner
              </h3>
              <button onClick={() => setIsReassignModalOpen(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {reassignLoading ? (
                <p>Loading...</p>
              ) : (
                reassignOptions.map((boy) => (
                  <div
                    key={boy.id}
                    onClick={() => setSelectedNewBoy(boy)}
                    className={`p-3 border mb-2 cursor-pointer ${
                      selectedNewBoy?.id === boy.id
                        ? "bg-blue-50 border-blue-500"
                        : ""
                    }`}
                  >
                    <p className="font-bold">{boy.name}</p>
                    <p className="text-xs">{boy.currentLoad} Active Orders</p>
                  </div>
                ))
              )}
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={handleSubmitReassignment}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Items & Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <FaBox className="text-blue-500" /> Order Items & Packing
              </h3>
              {/* Status Badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  order.status === "PACKED"
                    ? "bg-orange-100 text-orange-700"
                    : order.status === "OUT_FOR_DELIVERY"
                    ? "bg-blue-100 text-blue-700"
                    : order.status === "DELIVERED"
                    ? "bg-green-100 text-green-700"
                    : order.status === "PARTIALLY_CANCELLED"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {order.status.replace(/_/g, " ")}
              </span>
            </div>

            <div className="p-6 space-y-4">
              {order.OrderItems.map((item, idx) => {
                const product = products[item.productId];
                const isStockLow =
                  product && product.warehouseStock < item.quantity;
                const isItemCancelled = item.status === "CANCELLED";

                return (
                  <div
                    key={idx}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border transition ${
                      item.status === "PACKED"
                        ? "bg-green-50 border-green-200"
                        : isItemCancelled
                        ? "bg-red-50 border-red-200 opacity-75"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    {/* PRODUCT INFO */}
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                        {product?.imageUrl ? (
                          <img
                            src={product.imageUrl}
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
                        <p
                          className={`font-bold text-sm ${
                            isItemCancelled
                              ? "text-red-800 line-through"
                              : "text-gray-800"
                          }`}
                        >
                          {product?.name || `Product ID: ${item.productId}`}
                        </p>

                        {isItemCancelled && (
                          <span className="text-xs font-bold text-red-600 flex items-center gap-1 mt-1">
                            <FaBan size={10} /> ITEM CANCELLED
                          </span>
                        )}

                        {!isItemCancelled && (
                          <>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <FaStore className="text-gray-400" />
                              Source:{" "}
                              <span className="font-semibold text-blue-600">
                                {getVendorShopName(item.vendorId)}
                              </span>
                            </p>
                            <div className="flex gap-3 mt-2 text-xs">
                              <div
                                className={`flex items-center gap-1 border px-2 py-0.5 rounded ${
                                  isStockLow
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-gray-50 text-gray-600"
                                }`}
                              >
                                <FaWarehouse /> Stock:{" "}
                                <strong>
                                  {product?.warehouseStock ?? "-"}
                                </strong>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <p className="font-bold text-gray-800">₹{item.price}</p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      {/* BUTTON Logic */}
                      <button
                        onClick={() => toggleItemReady(idx)}
                        // ✅ FIX: Disable if Not (Processing OR Partially Cancelled), or if Item Cancelled
                        disabled={!isPackingAllowed || isItemCancelled}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                          item.status === "PACKED"
                            ? "bg-green-100 text-green-700 cursor-default"
                            : isItemCancelled
                            ? "bg-transparent text-red-500 cursor-not-allowed border border-red-200"
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                        } ${
                          !isPackingAllowed || isItemCancelled
                            ? "opacity-60 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {item.status === "PACKED" ? (
                          <>
                            <FaCheckCircle /> Packed
                          </>
                        ) : isItemCancelled ? (
                          <>
                            <FaBan /> Cancelled
                          </>
                        ) : (
                          "Mark Packed"
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ACTION FOOTER */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-500 font-medium">
                {isPackingAllowed ? (
                  <span>
                    Action Required: Pack remaining valid items to proceed.
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-blue-600">
                    <FaMotorcycle /> Logistics handled by Delivery Partner
                  </span>
                )}
              </div>

              {/* ✅ FIX: Show "Complete Packing" if status is PROCESSING or PARTIALLY_CANCELLED */}
              {isPackingAllowed && (
                <button
                  onClick={handleMarkPacked}
                  disabled={!areAllItemsReady}
                  className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition shadow-md ${
                    areAllItemsReady
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <FaBox />
                  {areAllItemsReady
                    ? "Complete Packing & Assign"
                    : "Pack Remaining Items"}
                </button>
              )}

              {/* Informative Messages for subsequent stages */}
              {order.status === "PACKED" && (
                <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded border border-orange-200 text-sm font-bold">
                  <FaClock /> Waiting for Pickup
                </div>
              )}
              {order.status === "OUT_FOR_DELIVERY" && (
                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded border border-blue-200 text-sm font-bold">
                  <FaMotorcycle /> Currently Out for Delivery
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-700 mb-4">Price Details</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Product Total (Active Items)</span>
                <span className="font-medium">
                  ₹{priceDetails.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="border-t pt-3 mt-2 flex justify-between font-bold text-lg text-gray-800">
                <span>Grand Total</span>
                <span>₹{priceDetails.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Payment & Delivery Partner */}
        <div className="space-y-6">
          {/* Payment Card */}
          <div
            className={`bg-white rounded-xl shadow-sm border p-6 ${
              !order.payment
                ? "border-orange-200 bg-orange-50"
                : "border-green-200 bg-green-50"
            }`}
          >
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaMoneyBillWave
                className={order.payment ? "text-green-600" : "text-orange-600"}
              />{" "}
              Payment Information
            </h3>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-600">Method</span>
              <span className="font-bold text-gray-800">
                {order.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">Status</span>
              <span
                className={`px-3 py-1 rounded text-xs font-bold ${
                  order.payment
                    ? "bg-green-200 text-green-800"
                    : "bg-orange-200 text-orange-800"
                }`}
              >
                {order.payment ? "PAID" : "PENDING"}
              </span>
            </div>
            {!order.payment && order.paymentMethod === "COD" && (
              <p className="text-xs text-center text-orange-800 mt-4 border-t border-orange-200 pt-2">
                Payment will be collected by Delivery Partner.
              </p>
            )}
          </div>

          {/* Delivery Partner Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <FaUserSecret className="text-blue-600" /> Delivery Partner
              </h3>
              {/* Reassign allowed only if not yet delivered */}
              {deliveryBoy &&
                order.status !== "DELIVERED" &&
                order.status !== "CANCELLED" && (
                  <button
                    onClick={handleOpenReassign}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded transition"
                  >
                    <FaExchangeAlt /> Reassign
                  </button>
                )}
            </div>

            {deliveryBoy ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                    <FaUserSecret size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">
                      {deliveryBoy.name}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <FaPhone size={12} /> {deliveryBoy.phone}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2 border border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Partner Status:</span>
                    <span className="font-semibold text-blue-600">
                      {assignment?.status || "ASSIGNED"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="font-medium">No Partner Assigned</p>
                {isPackingAllowed && (
                  <p className="text-xs mt-2 text-blue-500">
                    Partner will be auto-assigned when you click <br />
                    <strong>"Complete Packing"</strong>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Customer Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-700 mb-4">Customer Details</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-bold text-gray-800 text-base">
                {order.address?.fullName || "Guest"}
              </p>
              <p>{order.address?.addressLine1}</p>
              {order.assignedArea && (
                <p className="font-semibold text-blue-600">
                  Area: {order.assignedArea}
                </p>
              )}
              <p>
                {order.address?.city}, {order.address?.state}
              </p>
              <p className="pt-2 font-mono text-gray-500">
                Ph: {order.address?.phone}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
