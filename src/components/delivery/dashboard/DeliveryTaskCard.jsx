/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  FaUndo,
  FaBoxOpen,
  FaCalendarAlt,
  FaPhone,
  FaRupeeSign,
  FaMapMarkerAlt,
  FaWarehouse,
  FaCheckCircle,
  FaQrcode,
  FaMoneyBillWave,
} from "react-icons/fa";
import api from "../../../services/api"; // 🟢 ADDED API IMPORT

const DeliveryTaskCard = ({ task, activeTab, onStatusUpdate }) => {
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [utrNumber, setUtrNumber] = useState("");

  // 🟢 NEW STATES FOR QR CODE
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  const isReturn = task.type === "RETURN_PICKUP";
  const address = task.address || {};
  const items = task.items || [];
  const requiresPaymentCollection =
    !isReturn && task.paymentMethod === "COD" && task.cashToCollect > 0;

  const mapQuery = `${address.addressLine1}, ${address.city}, ${address.state}`;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=$$${encodeURIComponent(mapQuery)}`;

  useEffect(() => {
    if (showPaymentFlow && task.cashToCollect === 0) {
      setShowPaymentFlow(false); // Auto-closes when webhook updates the DB!
    }
  }, [task.cashToCollect, showPaymentFlow]);

  const handleDeliverClick = () => {
    if (requiresPaymentCollection) {
      setShowPaymentFlow(true);
    } else {
      onStatusUpdate(task.assignmentId, "DELIVERED");
    }
  };

  const handleSelectQRMode = async () => {
    setPaymentMode("QR");

    // Only fetch if we haven't already generated it for this session
    if (!qrCodeUrl) {
      setQrLoading(true);
      try {
        const { data } = await api.post("/orders/payment/delivery-qr", {
          orderId: task.orderId,
        });
        if (data.success) {
          setQrCodeUrl(data.qrCodeUrl);
        }
      } catch (error) {
        console.error("Failed to fetch Razorpay QR", error);
      } finally {
        setQrLoading(false);
      }
    }
  };

  const handleConfirmPaymentAndDeliver = () => {
    if (paymentMode === "QR" && !utrNumber.trim()) {
      alert("Please enter the UTR number for manual QR payment verification.");
      return;
    }

    onStatusUpdate(task.assignmentId, "DELIVERED", {
      codPaymentMode: paymentMode,
      utrNumber: paymentMode === "QR" ? utrNumber : undefined,
    });

    setShowPaymentFlow(false);
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border overflow-hidden relative transition-all hover:shadow-md ${
        isReturn
          ? "border-l-4 border-l-red-500"
          : "border-l-4 border-l-green-500"
      }`}
    >
      <div className="absolute top-3 right-3">
        {isReturn ? (
          <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-red-200">
            <FaUndo /> Return Pickup
          </span>
        ) : (
          <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-green-200">
            <FaBoxOpen /> Delivery
          </span>
        )}
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2 text-gray-400 text-xs font-mono mb-2">
          <span>#{task.orderId}</span>
          <span>•</span>
          <FaCalendarAlt />{" "}
          {new Date(
            task.date || task.updatedAt || Date.now(),
          ).toLocaleDateString()}
        </div>

        {/* Customer & Cash */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">
              {task.customerName || "Customer"}
            </h3>
            <a
              href={`tel:${task.phone}`}
              className="text-blue-600 text-sm flex items-center gap-1 font-medium hover:underline"
            >
              <FaPhone size={12} /> {task.phone}
            </a>
          </div>

          <div className="text-right">
            {isReturn ? (
              <span className="text-xs font-bold text-gray-400 uppercase">
                Do Not Pay
              </span>
            ) : task.cashToCollect > 0 ? (
              <div className="text-orange-600 font-bold flex flex-col items-end animate-fade-in">
                <span className="text-xs text-gray-500 font-normal">
                  Collect Payment
                </span>
                <span className="text-lg flex items-center">
                  <FaRupeeSign size={14} /> {task.cashToCollect}
                </span>
              </div>
            ) : (
              <span className="text-green-600 text-xs font-bold uppercase border border-green-200 px-2 py-1 rounded bg-green-50 animate-fade-in">
                Prepaid Verified
              </span>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600 w-3/4">
            <p className="line-clamp-2">
              {address.addressLine1}, {address.area}, {address.city}
            </p>
          </div>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200 transition"
          >
            <FaMapMarkerAlt />
          </a>
        </div>

        {/* Items List */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 uppercase font-bold mb-1">
            Items to {isReturn ? "Verify & Pick" : "Deliver"}
          </p>
          <div className="space-y-1">
            {items.length > 0 ? (
              items.map((item, idx) => (
                <div
                  key={idx}
                  className="text-sm text-gray-700 flex justify-between border-b border-gray-100 pb-1 last:border-0"
                >
                  <span>
                    {item.Product?.name || "Product Item"}{" "}
                    <span className="text-gray-400">x{item.quantity}</span>
                  </span>
                  {isReturn && (
                    <span className="text-xs text-red-500 italic block mt-0.5">
                      Reason: {item.returnReason || "N/A"}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <span className="text-xs text-gray-400 italic">
                Item details not available
              </span>
            )}
          </div>
        </div>

        {/* Active Tab Actions */}
        {activeTab === "active" && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {task.status === "ASSIGNED" && (
              <button
                onClick={() => onStatusUpdate(task.assignmentId, "PICKED")}
                className={`w-full py-3 rounded-xl font-bold text-white shadow-md flex justify-center items-center gap-2 transition-transform active:scale-95 ${
                  isReturn
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <FaBoxOpen />{" "}
                {isReturn ? "Pick from Customer" : "Pick from Warehouse"}
              </button>
            )}

            {(task.status === "PICKED" ||
              task.status === "OUT_FOR_DELIVERY") && (
              <>
                {!showPaymentFlow ? (
                  <button
                    onClick={handleDeliverClick}
                    className={`w-full py-3 rounded-xl font-bold text-white shadow-md flex justify-center items-center gap-2 transition-transform active:scale-95 ${
                      isReturn
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {isReturn ? (
                      <>
                        <FaWarehouse /> Drop at Warehouse
                      </>
                    ) : (
                      <>
                        <FaCheckCircle /> Mark Delivered
                      </>
                    )}
                  </button>
                ) : (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 animate-fade-in">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <FaRupeeSign className="text-orange-600" /> Collect ₹
                      {task.cashToCollect}
                    </h4>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <button
                        onClick={() => setPaymentMode("CASH")}
                        className={`py-2 rounded-lg font-bold flex items-center justify-center gap-2 border transition-colors ${
                          paymentMode === "CASH"
                            ? "bg-green-600 text-white border-green-600 shadow-sm"
                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <FaMoneyBillWave /> Cash
                      </button>
                      <button
                        onClick={handleSelectQRMode}
                        className={`py-2 rounded-lg font-bold flex items-center justify-center gap-2 border transition-colors ${
                          paymentMode === "QR"
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <FaQrcode /> QR/UPI
                      </button>
                    </div>

                    {paymentMode === "QR" && (
                      <div className="mb-4 animate-fade-in">
                        {qrLoading ? (
                          <div className="py-6 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl mb-4 bg-white/50">
                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <span className="text-xs text-gray-500 font-medium">
                              Generating Secure QR...
                            </span>
                          </div>
                        ) : qrCodeUrl ? (
                          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 mb-4 text-center">
                            <img
                              src={qrCodeUrl}
                              alt="Razorpay Payment QR"
                              className="w-48 h-48 mx-auto object-contain"
                            />
                            <p className="text-[11px] text-blue-600 font-bold mt-2 uppercase tracking-wide">
                              Scan with PhonePe, GPay, Paytm
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-red-500 mb-4 text-center italic">
                            Failed to load QR. Please use manual UTR or collect
                            Cash.
                          </p>
                        )}

                        <label className="block text-xs font-bold text-gray-600 mb-1">
                          Manual UTR (Optional fallback)
                        </label>
                        <p className="text-[10px] text-gray-500 mb-2">
                          If customer pays this QR, this screen will auto-close
                          when verified. If they pay a shop QR instead, enter
                          the UTR below.
                        </p>
                        <input
                          type="text"
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value)}
                          placeholder="e.g. 312345678901"
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowPaymentFlow(false)}
                        className="flex-1 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmPaymentAndDeliver}
                        className="flex-1 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-1 shadow-sm"
                      >
                        <FaCheckCircle /> Confirm & Deliver
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryTaskCard;
