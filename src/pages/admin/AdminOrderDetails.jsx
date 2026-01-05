import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getAdminOrderDetails,
  updateOrderStatus,
  getAllVendors,
  updateOrderItemStatus,
} from "../../services/orderService";
import { getProductById } from "../../services/productService";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaTruck,
  FaBox,
  FaStore,
  FaMoneyBillWave,
  FaClipboardCheck,
  FaWarehouse,
  FaLayerGroup,
} from "react-icons/fa";

const AdminOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data States
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState({});

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Order Data
      const orderData = await getAdminOrderDetails(id);
      setOrder(orderData);

      // 2. Fetch Vendors (Safe)
      try {
        const vendorsData = await getAllVendors();
        setVendors(vendorsData);
      } catch (vendorError) {
        console.warn("Failed to load vendors:", vendorError);
        setVendors([]);
      }

      // 3. Fetch Products (to get Stock Data)
      await fetchProductData(orderData.OrderItems);
    } catch (err) {
      console.error("Error fetching critical order data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to fetch/refetch products
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

  // ✅ VALIDATION LOGIC: Check Stock Before Packing
  const toggleItemReady = async (index) => {
    const item = order.OrderItems[index];
    const product = products[item.productId];

    // Determine Logic
    const newStatus = item.status === "PACKED" ? "PENDING" : "PACKED";

    // 🛑 CONSTRAINT: Check Warehouse Stock
    if (newStatus === "PACKED") {
      if (!product) {
        alert("Product data not loaded yet. Please wait.");
        return;
      }
      // If Warehouse Stock is insufficient
      if (product.warehouseStock < item.quantity) {
        alert(
          `⛔ INSUFFICIENT WAREHOUSE STOCK!\n\n` +
            `Required: ${item.quantity}\n` +
            `Available in Warehouse: ${product.warehouseStock}\n\n` +
            `Please transfer stock to warehouse before packing.`
        );
        return; // Stop execution
      }
    }

    try {
      const updatedItems = [...order.OrderItems];
      updatedItems[index].status = newStatus;
      setOrder({ ...order, OrderItems: updatedItems });

      // ✅ Corrected Call: Pass order.id, then item.id
      await updateOrderItemStatus(order.id, item.id, newStatus);

      // 🔄 Refetch products to show updated/deducted stock immediately
      fetchProductData(order.OrderItems);
    } catch (err) {
      console.error(err);
      alert("Failed to update status. Server might be enforcing stock limits.");
      fetchData(); // Revert
    }
  };

  const areAllItemsReady = order?.OrderItems?.every(
    (item) => item.status === "PACKED"
  );

  const handleDispatch = async () => {
    if (!areAllItemsReady) return;
    if (window.confirm("Mark this order as OUT FOR DELIVERY?")) {
      try {
        await updateOrderStatus(order.id, "OUT_FOR_DELIVERY");
        setOrder({ ...order, status: "OUT_FOR_DELIVERY" });
        alert("Order Dispatched Successfully!");
      } catch (e) {
        console.error(e);
        alert("Failed to update status");
      }
    }
  };

  const handleDeliver = async () => {
    if (
      window.confirm(
        "Confirm Delivery? This will mark the order as PAID and DELIVERED."
      )
    ) {
      try {
        await updateOrderStatus(order.id, "DELIVERED");
        setOrder({ ...order, status: "DELIVERED", payment: true });
        alert("Order Delivered & Payment Recorded!");
      } catch (e) {
        console.error(e);
        alert("Failed to update status");
      }
    }
  };

  const calculatePriceDetails = () => {
    if (!order) return { subtotal: 0, shipping: 0, total: 0 };
    const subtotal = order.OrderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const total = order.amount;
    const shipping = total - subtotal;
    return { subtotal, shipping, total };
  };

  const priceDetails = calculatePriceDetails();

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
          {/* ORDER ITEMS & STOCK CHECK */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <FaBox className="text-blue-500" /> Order Items & Stock
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  areAllItemsReady
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {areAllItemsReady
                  ? "Ready for Dispatch"
                  : "Packing in Progress"}
              </span>
            </div>

            <div className="p-6 space-y-4">
              {order.OrderItems.map((item, idx) => {
                const product = products[item.productId];
                const isStockLow =
                  product && product.warehouseStock < item.quantity;

                return (
                  <div
                    key={idx}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border transition ${
                      item.status === "PACKED"
                        ? "bg-green-50 border-green-200"
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
                        <p className="font-bold text-gray-800 text-sm">
                          {product?.name || `Product ID: ${item.productId}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <FaStore className="text-gray-400" />
                          Source:{" "}
                          <span className="font-semibold text-blue-600">
                            {getVendorShopName(item.vendorId)}
                          </span>
                        </p>

                        {/* 🟢 STOCK DISPLAY */}
                        <div className="flex gap-3 mt-2 text-xs">
                          <div
                            className={`flex items-center gap-1 border px-2 py-0.5 rounded ${
                              isStockLow
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-gray-50 text-gray-600 border-gray-200"
                            }`}
                          >
                            <FaWarehouse /> Warehouse:{" "}
                            <strong>{product?.warehouseStock ?? "-"}</strong>
                          </div>
                          <div className="flex items-center gap-1 border px-2 py-0.5 rounded bg-gray-50 text-gray-600 border-gray-200">
                            <FaLayerGroup /> Total:{" "}
                            <strong>{product?.totalStock ?? "-"}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS & PRICE */}
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <p className="font-bold text-gray-800">₹{item.price}</p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      {/* 🔒 UPDATED BUTTON: PERMANENT PACKING */}
                      <button
                        onClick={() => toggleItemReady(idx)}
                        disabled={
                          order.status === "DELIVERED" ||
                          order.status === "CANCELLED" ||
                          item.status === "PACKED" // 👈 DISABLED IF ALREADY PACKED
                        }
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                          item.status === "PACKED"
                            ? "bg-green-100 text-green-700 cursor-default" // Change style to look static
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                        } ${
                          order.status === "DELIVERED" ||
                          item.status === "PACKED"
                            ? "opacity-100"
                            : ""
                        }`}
                      >
                        {item.status === "PACKED" ? (
                          <>
                            <FaCheckCircle /> Packed
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
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-500 font-medium">
                Current Status:{" "}
                <span className="text-gray-800 font-bold">{order.status}</span>
              </div>

              <div className="flex gap-3">
                {order.status !== "OUT_FOR_DELIVERY" &&
                  order.status !== "DELIVERED" && (
                    <button
                      onClick={handleDispatch}
                      disabled={
                        !areAllItemsReady || order.status === "CANCELLED"
                      }
                      className={`px-5 py-2 rounded-lg font-bold flex items-center gap-2 transition ${
                        !areAllItemsReady
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                      }`}
                    >
                      <FaTruck /> Dispatch Order
                    </button>
                  )}

                {(order.status === "OUT_FOR_DELIVERY" ||
                  order.status === "PACKED") && (
                  <button
                    onClick={handleDeliver}
                    className="px-5 py-2 rounded-lg font-bold flex items-center gap-2 transition bg-green-600 text-white hover:bg-green-700 shadow-md"
                  >
                    <FaClipboardCheck /> Mark Delivered
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* PRICE DETAILS */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-700 mb-4">Price Details</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Product Total</span>
                <span className="font-medium">
                  ₹{priceDetails.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Charges</span>
                <span className="text-green-600 font-medium">
                  {priceDetails.shipping > 0
                    ? `+ ₹${priceDetails.shipping}`
                    : "Free"}
                </span>
              </div>
              <div className="border-t pt-3 mt-2 flex justify-between font-bold text-lg text-gray-800">
                <span>Grand Total</span>
                <span>₹{priceDetails.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
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
              <div className="mt-4 pt-4 border-t border-orange-200">
                <p className="text-xs text-orange-800 mb-3">
                  ⚠️ Confirm payment only after cash collection.
                </p>
                <button
                  onClick={handleDeliver}
                  className="w-full py-2 bg-orange-600 text-white rounded-lg font-bold text-sm hover:bg-orange-700 shadow-sm transition flex justify-center items-center gap-2"
                >
                  <FaCheckCircle /> Confirm Payment & Delivery
                </button>
              </div>
            )}

            {order.payment && (
              <div className="mt-2 text-center text-xs font-bold text-green-700">
                ✅ Order is fully paid.
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
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
