import { useEffect, useState } from "react";
import {
  FaMoneyBillWave,
  FaUserSecret,
  FaCheckCircle,
  FaHistory,
  FaArrowRight,
} from "react-icons/fa";
import { getCODReconciliation, settleCOD } from "../../services/orderService";

const AdminCODReconciliation = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedBoy, setSelectedBoy] = useState(null);
  const [isSettling, setIsSettling] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await getCODReconciliation();
      setData(result);
    } catch (error) {
      alert("Failed to fetch reconciliation data");
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = async () => {
    if (!selectedBoy) return;
    setIsSettling(true);
    try {
      // Extract all Order IDs for this boy to settle
      const orderIds = selectedBoy.orders.map((o) => o.orderId);

      await settleCOD(selectedBoy.deliveryBoyId, orderIds);

      alert("Cash settled successfully!");
      setSelectedBoy(null); // Close Modal
      fetchData(); // Refresh Data
    } catch (error) {
      alert("Settlement failed: " + error.message);
    } finally {
      setIsSettling(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaMoneyBillWave className="text-green-600" /> Cash on Delivery (COD)
        Reconciliation
      </h2>

      {/* 📊 SUMMARY CARD */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white mb-8">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-green-100 font-medium mb-1">
              Total Unsettled Cash
            </p>
            <h3 className="text-4xl font-bold">
              ₹{data?.totalUnsettledAmount?.toLocaleString() || 0}
            </h3>
            <p className="text-sm text-green-100 mt-2 opacity-80">
              Cash currently held by Delivery Partners
            </p>
          </div>
          <div className="bg-white/20 p-4 rounded-full">
            <FaMoneyBillWave size={40} />
          </div>
        </div>
      </div>

      {/* 📋 LIST OF DELIVERY BOYS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.details?.length > 0 ? (
          data.details.map((boy) => (
            <div
              key={boy.deliveryBoyId}
              className="bg-white rounded-lg shadow border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-3 rounded-full text-gray-600">
                    <FaUserSecret size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">
                      {boy.deliveryBoyName}
                    </h4>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      ID: {boy.deliveryBoyId}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Holding</p>
                  <p className="text-xl font-bold text-red-600">
                    ₹{boy.totalCashOnHand}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <span>Pending Orders:</span>
                  <span className="font-semibold">{boy.orders.length}</span>
                </div>

                <button
                  onClick={() => setSelectedBoy(boy)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  Review & Settle <FaArrowRight />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <FaCheckCircle className="text-green-400 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-800">All Settled!</h3>
            <p className="text-gray-500">
              No active COD cash pending with delivery partners.
            </p>
          </div>
        )}
      </div>

      {/* 🏁 SETTLEMENT MODAL */}
      {selectedBoy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Settle Cash Collection</h3>
              <button
                onClick={() => setSelectedBoy(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Confirm you have received <b>₹{selectedBoy.totalCashOnHand}</b>{" "}
                from <b>{selectedBoy.deliveryBoyName}</b> for the following
                orders:
              </p>

              <div className="bg-gray-50 rounded border max-h-48 overflow-y-auto mb-6">
                <table className="w-full text-sm text-left">
                  <thead className="text-gray-500 bg-gray-100 sticky top-0">
                    <tr>
                      <th className="p-2">Order ID</th>
                      <th className="p-2">Date</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBoy.orders.map((order) => (
                      <tr key={order.orderId} className="border-t">
                        <td className="p-2 font-mono">#{order.orderId}</td>
                        <td className="p-2 text-gray-500">
                          {new Date(order.deliveredAt).toLocaleDateString()}
                        </td>
                        <td className="p-2 text-right font-medium">
                          ₹{order.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedBoy(null)}
                  className="flex-1 px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSettle}
                  disabled={isSettling}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  {isSettling ? "Settling..." : "Confirm Deposit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCODReconciliation;
