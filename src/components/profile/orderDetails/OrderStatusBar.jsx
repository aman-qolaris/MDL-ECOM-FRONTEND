const OrderStatusBar = ({ order }) => {
  const getStatusColor = (status) => {
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
    return status.replace(/_/g, " ").replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

  return (
    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div>
        <p className="text-xs text-gray-500 uppercase font-bold">Order Date</p>
        <p className="text-gray-800 font-medium">
          {order.createdAt
            ? new Date(order.createdAt).toLocaleDateString()
            : new Date().toLocaleDateString()}
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Status</p>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
            order.status,
          )}`}
        >
          {formatStatus(order.status)}
        </span>
      </div>
    </div>
  );
};

export default OrderStatusBar;
