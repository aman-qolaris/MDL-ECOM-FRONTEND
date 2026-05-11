import { useEffect, useState } from "react";
import PropTypes from "prop-types"; // 🟢 FIX: Added PropTypes import
import { useParams, Link } from "react-router-dom";
import { getDeliveryBoyOrdersAdmin } from "../../services/orderService";
import { FaArrowLeft, FaBoxOpen, FaHistory, FaUndo } from "react-icons/fa";

const StatusBadge = ({ status, type }) => {
  const isReturn = type === "RETURN";

  // Custom Labels
  let label = status;
  if (isReturn) {
    if (status === "ASSIGNED") label = "Pickup Assigned";
    if (status === "PICKED") label = "Return Picked";
    if (status === "DELIVERED") label = "Returned to Warehouse";
  }

  // Custom Colors
  let style = "bg-gray-100 text-gray-800";
  if (status === "ASSIGNED") style = "bg-blue-100 text-blue-800";
  if (status === "PICKED") style = "bg-yellow-100 text-yellow-800";
  if (status === "FAILED") style = "bg-red-100 text-red-800";
  if (status === "DELIVERED") {
    style = isReturn
      ? "bg-purple-100 text-purple-800"
      : "bg-green-100 text-green-800";
  }

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit ${style}`}
    >
      {isReturn && <FaUndo size={10} />} {label}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  type: PropTypes.string,
};

const OrderTable = ({ orders, emptyMessage }) => {
  const renderCashToCollect = (order) => {
    if (order.type === "RETURN") {
      return (
        <span className="text-gray-400 text-xs font-normal">N/A (Return)</span>
      );
    }

    if (order.cashToCollect > 0) {
      return <span>₹{order.cashToCollect}</span>;
    }

    return <span>-</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
      {orders.length === 0 ? (
        <div className="p-6 text-center text-gray-500">{emptyMessage}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase border-b">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer Address</th>
                <th className="p-4">Assignment Status</th>
                <th className="p-4">Order Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Cash To Collect</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.assignmentId}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-4 font-bold text-gray-700">#{order.id}</td>
                  <td className="p-4 text-sm text-gray-600 max-w-xs truncate">
                    {order.address?.addressLine1}, {order.address?.city}
                    <div className="text-xs text-blue-600 font-semibold">
                      {order.assignedArea}
                    </div>
                  </td>

                  {/* PASS TYPE TO BADGE */}
                  <td className="p-4">
                    <StatusBadge
                      status={order.assignmentStatus}
                      type={order.type}
                    />
                  </td>

                  <td className="p-4">₹{order.amount}</td>
                  <td className="p-4 text-sm">
                    <span className="font-semibold">{order.paymentMethod}</span>
                    <span
                      className={`ml-2 text-xs ${
                        order.payment ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {order.payment ? "(PAID)" : "(UNPAID)"}
                    </span>
                  </td>

                  {/* 🟢 HIDE CASH FOR RETURNS (Logic Extracted) */}
                  <td className="p-4 font-bold text-red-600">
                    {renderCashToCollect(order)}
                  </td>

                  <td className="p-4">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:underline text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 rounded px-1"
                    >
                      View Full Order
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

OrderTable.propTypes = {
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      assignmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      assignmentStatus: PropTypes.string.isRequired,
      type: PropTypes.string,
      amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      paymentMethod: PropTypes.string,
      payment: PropTypes.any,
      cashToCollect: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      assignedArea: PropTypes.string,
      address: PropTypes.shape({
        addressLine1: PropTypes.string,
        city: PropTypes.string,
      }),
    }),
  ).isRequired,
  emptyMessage: PropTypes.string.isRequired,
};

const AdminDeliveryBoyDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState({ active: [], history: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDeliveryBoyOrdersAdmin(id);
        setData(result);
      } catch (error) {
        console.error("Error fetching boy orders", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading Orders...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Link
        to="/admin/assigned-orders"
        className="flex items-center text-gray-500 hover:text-blue-600 mb-6 w-fit focus:outline-none focus:ring-2 focus:ring-blue-200 rounded px-1"
      >
        <FaArrowLeft className="mr-2" /> Back to Staff List
      </Link>

      <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
        <FaBoxOpen /> Active Assignments ({data.active.length})
      </h2>
      <OrderTable
        orders={data.active}
        emptyMessage="No active orders currently assigned."
      />

      <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2 mt-8">
        <FaHistory /> Assignment History
      </h2>
      <OrderTable orders={data.history} emptyMessage="No history found." />
    </div>
  );
};

export default AdminDeliveryBoyDetails;
