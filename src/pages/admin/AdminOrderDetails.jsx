import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt, FaHashtag } from "react-icons/fa";
import {
  getAdminOrderDetails,
  updateOrderStatus,
  getAllVendors,
  updateOrderItemStatus,
  getReassignmentOptions,
  reassignDeliveryBoy,
} from "../../services/orderService";
import { getProductById } from "../../services/productService";

// Sub-components
import ReassignmentModal from "../../components/admin/orders/details/ReassignmentModal";
import OrderItemsSection from "../../components/admin/orders/details/OrderItemsSection";
import OrderPriceDetails from "../../components/admin/orders/details/OrderPriceDetails";
import OrderPaymentInfo from "../../components/admin/orders/details/OrderPaymentInfo";
import OrderDeliveryPartner from "../../components/admin/orders/details/OrderDeliveryPartner";
import OrderCustomerInfo from "../../components/admin/orders/details/OrderCustomerInfo";

const AdminOrderDetails = () => {
  const navigate = useNavigate(); // 🟢 Hook for navigation
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        console.error(`Failed to fetch product ${item.productId}`, e);
      }
    });
    await Promise.all(productPromises);
    setProducts(productMap);
  };

  const toggleItemReady = async (index) => {
    const item = order.OrderItems[index];
    const product = products[item.productId];

    if (item.status === "CANCELLED" || item.status === "PACKED") return;

    const newStatus = "PACKED";

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

  const areAllItemsReady = order?.OrderItems?.every(
    (item) => item.status === "PACKED" || item.status === "CANCELLED"
  );

  const isPackingAllowed =
    order &&
    (order.status === "PROCESSING" || order.status === "PARTIALLY_CANCELLED");

  const handleMarkPacked = async () => {
    if (!areAllItemsReady) return;
    try {
      await updateOrderStatus(order.id, "PACKED");
      await fetchData();
      alert("Order Marked as PACKED. Delivery Partner Assigned.");
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

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
    if (!order) return { subtotal: 0, total: 0, shippingCharge: 0, creditApplied: 0 };
    
    const activeItems = order.OrderItems.filter(
      (item) => item.status !== "CANCELLED"
    );
    
    const subtotal = activeItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // 🟢 UPDATED: Include explicit shipping and credit fields
    return { 
      subtotal, 
      total: order.amount, // This is the final payable amount
      shippingCharge: order.shippingCharge,
      creditApplied: order.creditApplied 
    };
  };
  
  const priceDetails = calculatePriceDetails();

  // Helper for Status Badge Color
  const getStatusColor = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-700 border-green-200";
      case "PACKED":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      case "PROCESSING":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">
        Loading Order Details...
      </div>
    );
  if (!order)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500 font-bold">
        Order Not Found
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12 animate-fadeIn">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Back Button & Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-600 transition-all shadow-sm group"
                title="Go Back"
              >
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              </button>

              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FaHashtag className="text-gray-300 text-lg" />
                  Order #{order.id}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <FaCalendarAlt className="text-gray-400" />
                  {new Date(order.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </div>
            </div>

            {/* Right: Status Badge */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Status:
              </span>
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-bold border shadow-sm ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* --- Reassignment Modal --- */}
        <ReassignmentModal
          isOpen={isReassignModalOpen}
          onClose={() => setIsReassignModalOpen(false)}
          loading={reassignLoading}
          options={reassignOptions}
          selectedBoy={selectedNewBoy}
          onSelectBoy={setSelectedNewBoy}
          onConfirm={handleSubmitReassignment}
        />

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT COLUMN: Items & Status (Takes 2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Passed props exactly as logic requires */}
              <OrderItemsSection
                order={order}
                products={products}
                vendors={vendors}
                onToggleItemReady={toggleItemReady}
                onMarkPacked={handleMarkPacked}
                isPackingAllowed={isPackingAllowed}
                areAllItemsReady={areAllItemsReady}
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <OrderPriceDetails priceDetails={priceDetails} />
            </div>
          </div>

          {/* RIGHT COLUMN: Payment, Delivery, Customer (Takes 1/3 width) */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-1">
              <OrderPaymentInfo order={order} />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-1">
              <OrderDeliveryPartner
                order={order}
                onReassign={handleOpenReassign}
                isPackingAllowed={isPackingAllowed}
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-1">
              <OrderCustomerInfo order={order} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
