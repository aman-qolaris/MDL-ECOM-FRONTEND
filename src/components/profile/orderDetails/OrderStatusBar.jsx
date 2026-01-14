const OrderStatusBar = ({ order }) => {
  return (
    <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100">
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
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            order.status === "DELIVERED"
              ? "bg-green-100 text-green-700"
              : order.status === "CANCELLED"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {order.status || "Processing"}
        </span>
      </div>
    </div>
  );
};

export default OrderStatusBar;
