import { useState, useEffect } from "react";
import { getMyOrders } from "../../services/orderService";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import OrderDetailModal from "./OrderDetailModal";

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
    globalThis.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getMyOrders(currentPage, 10);
      if (data.orders) {
        setOrders(data.orders);
        setTotalPages(data.totalPages);
      } else {
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "PROCESSING":
        return "bg-blue-100 text-blue-700";
      case "PACKED":
        return "bg-indigo-100 text-indigo-700";
      case "OUT_FOR_DELIVERY":
        return "bg-purple-100 text-purple-700";
      case "DELIVERED":
        return "bg-green-100 text-green-700";
      case "RETURN_REQUESTED":
        return "bg-orange-100 text-orange-700";
      case "CANCELLED":
      case "PARTIALLY_CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Processing";
    return status.replaceAll("_", " ").toUpperCase();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-10 text-gray-500">Loading orders...</div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No orders found.</p>
        </div>
      );
    }

    return (
      <>
        <div className="space-y-4 mb-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-100 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-sm transition-shadow bg-white gap-4"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-800">
                    Order #{order.id}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider ${getStatusStyle(
                      order.status,
                    )}`}
                  >
                    {formatStatus(order.status)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto sm:block text-right">
                <p className="font-bold text-gray-900 text-lg">
                  ₹{order.amount?.toLocaleString()}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(order)}
                  className="text-sm text-blue-600 font-medium hover:underline mt-1 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded px-1"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <FaChevronLeft />
            </button>

            <div className="flex gap-2">
              {/* 🟢 FIX: Replaced spread clone with Array.from and used stable keys */}
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                if (
                  totalPages > 7 &&
                  Math.abs(currentPage - pageNum) > 2 &&
                  pageNum !== 1 &&
                  pageNum !== totalPages
                ) {
                  if (Math.abs(currentPage - pageNum) === 3)
                    return (
                      <span
                        key={`ellipsis-${totalPages}-${pageNum}`}
                        className="pt-1 text-gray-400"
                      >
                        ...
                      </span>
                    );
                  return null;
                }

                return (
                  <button
                    key={`page-btn-${totalPages}-${pageNum}`}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <FaChevronRight />
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Order History</h2>
        <span className="text-sm text-gray-500">
          Page {currentPage} of {totalPages || 1}
        </span>
      </div>

      {renderContent()}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setSelectedOrder(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
};

export default OrdersTab;
