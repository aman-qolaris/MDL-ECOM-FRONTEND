import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
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
    if (!order) return { subtotal: 0, total: 0 };
    const activeItems = order.OrderItems.filter(
      (item) => item.status !== "CANCELLED"
    );
    const subtotal = activeItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    return { subtotal, total: order.amount };
  };

  const priceDetails = calculatePriceDetails();

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Items & Status */}
        <div className="lg:col-span-2 space-y-6">
          <OrderItemsSection
            order={order}
            products={products}
            vendors={vendors}
            onToggleItemReady={toggleItemReady}
            onMarkPacked={handleMarkPacked}
            isPackingAllowed={isPackingAllowed}
            areAllItemsReady={areAllItemsReady}
          />

          <OrderPriceDetails priceDetails={priceDetails} />
        </div>

        {/* RIGHT COLUMN: Payment & Delivery Partner */}
        <div className="space-y-6">
          <OrderPaymentInfo order={order} />

          <OrderDeliveryPartner
            order={order}
            onReassign={handleOpenReassign}
            isPackingAllowed={isPackingAllowed}
          />

          <OrderCustomerInfo order={order} />
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
