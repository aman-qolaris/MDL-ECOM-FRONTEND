import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
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
  FaClipboardCheck,
} from "react-icons/fa";
import api from "../../../services/api";

// ----------------------------------------------------------------------
// Helper Component: Cash Status Badge
// ----------------------------------------------------------------------
const CashStatusBadge = ({ isReturn, cashToCollect }) => {
  if (isReturn) {
    return (
      <span className="text-xs font-bold text-gray-400 uppercase">
        Do Not Pay
      </span>
    );
  }
  if (cashToCollect > 0) {
    return (
      <div className="text-orange-600 font-bold flex flex-col items-end animate-fade-in">
        <span className="text-xs text-gray-500 font-normal">
          Collect Payment
        </span>
        <span className="text-lg flex items-center">
          <FaRupeeSign size={14} /> {cashToCollect}
        </span>
      </div>
    );
  }
  return (
    <span className="text-green-600 text-xs font-bold uppercase border border-green-200 px-2 py-1 rounded bg-green-50 animate-fade-in">
      Prepaid Verified
    </span>
  );
};

CashStatusBadge.propTypes = {
  isReturn: PropTypes.bool.isRequired,
  cashToCollect: PropTypes.number,
};

// ----------------------------------------------------------------------
// Helper Component: Payment Flow UI
// ----------------------------------------------------------------------
const PaymentFlowBox = ({
  task,
  paymentMode,
  setPaymentMode,
  qrLoading,
  qrCodeUrl,
  utrNumber,
  setUtrNumber,
  handleSelectQRMode,
  setShowPaymentFlow,
  handleConfirmPaymentAndDeliver,
}) => {
  // 🟢 FIX: Extracted nested ternary logic into an independent statement/function
  const renderQRState = () => {
    if (qrLoading) {
      return (
        <div className="py-6 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl mb-4 bg-white/50">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
          <span className="text-xs text-gray-500 font-medium">
            Generating Secure QR...
          </span>
        </div>
      );
    }
    if (qrCodeUrl) {
      return (
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
      );
    }
    return (
      <p className="text-xs text-red-500 mb-4 text-center italic">
        Failed to load QR. Please use manual UTR or collect Cash.
      </p>
    );
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 animate-fade-in">
      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        <FaRupeeSign className="text-orange-600" /> Collect ₹
        {task.cashToCollect}
      </h4>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          type="button"
          onClick={() => setPaymentMode("CASH")}
          className={`py-2 rounded-lg font-bold flex items-center justify-center gap-2 border transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 ${
            paymentMode === "CASH"
              ? "bg-green-600 text-white border-green-600 shadow-sm"
              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
          }`}
        >
          <FaMoneyBillWave /> Cash
        </button>
        <button
          type="button"
          onClick={handleSelectQRMode}
          className={`py-2 rounded-lg font-bold flex items-center justify-center gap-2 border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
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
          {renderQRState()}

          {/* 🟢 FIX: Added htmlFor to explicitly link the label to the input via ID */}
          <label
            htmlFor={`utr-input-${task.orderId}`}
            className="block text-xs font-bold text-gray-600 mb-1"
          >
            Manual UTR (Optional fallback)
          </label>
          <input
            id={`utr-input-${task.orderId}`}
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
          type="button"
          onClick={() => setShowPaymentFlow(false)}
          className="flex-1 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirmPaymentAndDeliver}
          className="flex-1 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <FaCheckCircle /> Confirm
        </button>
      </div>
    </div>
  );
};

PaymentFlowBox.propTypes = {
  task: PropTypes.shape({
    cashToCollect: PropTypes.number,
    orderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  paymentMode: PropTypes.string.isRequired,
  setPaymentMode: PropTypes.func.isRequired,
  qrLoading: PropTypes.bool.isRequired,
  qrCodeUrl: PropTypes.string,
  utrNumber: PropTypes.string.isRequired,
  setUtrNumber: PropTypes.func.isRequired,
  handleSelectQRMode: PropTypes.func.isRequired,
  setShowPaymentFlow: PropTypes.func.isRequired,
  handleConfirmPaymentAndDeliver: PropTypes.func.isRequired,
};

// ----------------------------------------------------------------------
// Helper Component: Assigned Action Area
// ----------------------------------------------------------------------
const AssignedActionArea = ({
  task,
  isReturn,
  itemVerified,
  setItemVerified,
  onStatusUpdate,
}) => {
  let btnClasses =
    "w-full py-3 rounded-xl font-bold text-white shadow-md flex justify-center items-center gap-2 transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 ";

  if (isReturn) {
    btnClasses += itemVerified
      ? "bg-orange-500 hover:bg-orange-600 focus:ring-orange-400"
      : "bg-orange-300 cursor-not-allowed";
  } else {
    btnClasses += "bg-blue-600 hover:bg-blue-700 focus:ring-blue-400";
  }

  return (
    <div className="space-y-3">
      {isReturn && (
        // 🟢 FIX: Added htmlFor to explicitly link the label to the input via ID
        <label
          htmlFor={`verify-item-${task.assignmentId}`}
          className="flex items-start gap-2 bg-red-50 p-3 rounded-lg border border-red-100 cursor-pointer"
        >
          <input
            id={`verify-item-${task.assignmentId}`}
            type="checkbox"
            className="mt-1 w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
            checked={itemVerified}
            onChange={(e) => setItemVerified(e.target.checked)}
          />
          <span className="text-xs text-red-800 font-medium">
            I have physically verified the item matches the return request and
            is ready for transport.
          </span>
        </label>
      )}

      <button
        type="button"
        onClick={() => onStatusUpdate(task.assignmentId, "PICKED")}
        disabled={isReturn && !itemVerified}
        className={btnClasses}
      >
        {isReturn ? <FaClipboardCheck /> : <FaBoxOpen />}
        {isReturn ? "Verify & Pick from Customer" : "Pick from Warehouse"}
      </button>
    </div>
  );
};

AssignedActionArea.propTypes = {
  task: PropTypes.shape({
    assignmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  isReturn: PropTypes.bool.isRequired,
  itemVerified: PropTypes.bool.isRequired,
  setItemVerified: PropTypes.func.isRequired,
  onStatusUpdate: PropTypes.func.isRequired,
};

// ----------------------------------------------------------------------
// Helper Component: Transit Action Area
// ----------------------------------------------------------------------
const TransitActionArea = ({
  task,
  isReturn,
  showPaymentFlow,
  setShowPaymentFlow,
  handleDeliverClick,
  paymentMode,
  setPaymentMode,
  qrLoading,
  qrCodeUrl,
  utrNumber,
  setUtrNumber,
  handleSelectQRMode,
  handleConfirmPaymentAndDeliver,
}) => {
  if (showPaymentFlow) {
    return (
      <PaymentFlowBox
        task={task}
        setShowPaymentFlow={setShowPaymentFlow}
        paymentMode={paymentMode}
        setPaymentMode={setPaymentMode}
        qrLoading={qrLoading}
        qrCodeUrl={qrCodeUrl}
        utrNumber={utrNumber}
        setUtrNumber={setUtrNumber}
        handleSelectQRMode={handleSelectQRMode}
        handleConfirmPaymentAndDeliver={handleConfirmPaymentAndDeliver}
      />
    );
  }

  const btnClasses = `w-full py-3 rounded-xl font-bold text-white shadow-md flex justify-center items-center gap-2 transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
    isReturn
      ? "bg-red-600 hover:bg-red-700 focus:ring-red-400"
      : "bg-green-600 hover:bg-green-700 focus:ring-green-400"
  }`;

  return (
    <button type="button" onClick={handleDeliverClick} className={btnClasses}>
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
  );
};

TransitActionArea.propTypes = {
  task: PropTypes.object.isRequired,
  isReturn: PropTypes.bool.isRequired,
  showPaymentFlow: PropTypes.bool.isRequired,
  setShowPaymentFlow: PropTypes.func.isRequired,
  handleDeliverClick: PropTypes.func.isRequired,
  paymentMode: PropTypes.string.isRequired,
  setPaymentMode: PropTypes.func.isRequired,
  qrLoading: PropTypes.bool.isRequired,
  qrCodeUrl: PropTypes.string,
  utrNumber: PropTypes.string.isRequired,
  setUtrNumber: PropTypes.func.isRequired,
  handleSelectQRMode: PropTypes.func.isRequired,
  handleConfirmPaymentAndDeliver: PropTypes.func.isRequired,
};

// ----------------------------------------------------------------------
// Helper Component: Action Area Router
// ----------------------------------------------------------------------
const TaskActionArea = (props) => {
  const { task } = props;

  if (task.status === "ASSIGNED") {
    return <AssignedActionArea {...props} />;
  }

  if (task.status === "PICKED" || task.status === "OUT_FOR_DELIVERY") {
    return <TransitActionArea {...props} />;
  }

  return null;
};

TaskActionArea.propTypes = {
  task: PropTypes.shape({
    status: PropTypes.string,
    assignmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    cashToCollect: PropTypes.number,
  }).isRequired,
};

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------
const DeliveryTaskCard = ({ task, activeTab, onStatusUpdate }) => {
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [utrNumber, setUtrNumber] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [itemVerified, setItemVerified] = useState(false);

  const isReturn =
    task.type === "RETURN_PICKUP" || task.reason === "RETURN_PICKUP";
  const address = task.address || {};
  const items = task.items || [];
  const requiresPaymentCollection =
    !isReturn && task.paymentMethod === "COD" && task.cashToCollect > 0;

  const mapQuery = `${address.addressLine1}, ${address.city}, ${address.state}`;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=$$${encodeURIComponent(mapQuery)}`;

  useEffect(() => {
    if (showPaymentFlow && task.cashToCollect === 0) {
      setShowPaymentFlow(false);
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
      globalThis.alert(
        "Please enter the UTR number for manual QR payment verification.",
      );
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
              className="text-blue-600 text-sm flex items-center gap-1 font-medium hover:underline focus:outline-none focus:ring-1 focus:ring-blue-300 rounded px-1"
            >
              <FaPhone size={12} /> {task.phone}
            </a>
          </div>

          <div className="text-right">
            <CashStatusBadge
              isReturn={isReturn}
              cashToCollect={task.cashToCollect}
            />
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
            className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Open in Google Maps"
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
                  key={item.id || `item-${idx}`}
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

        {/* Action Area */}
        {activeTab === "active" && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <TaskActionArea
              task={task}
              isReturn={isReturn}
              itemVerified={itemVerified}
              setItemVerified={setItemVerified}
              onStatusUpdate={onStatusUpdate}
              showPaymentFlow={showPaymentFlow}
              setShowPaymentFlow={setShowPaymentFlow}
              handleDeliverClick={handleDeliverClick}
              paymentMode={paymentMode}
              setPaymentMode={setPaymentMode}
              qrLoading={qrLoading}
              qrCodeUrl={qrCodeUrl}
              utrNumber={utrNumber}
              setUtrNumber={setUtrNumber}
              handleSelectQRMode={handleSelectQRMode}
              handleConfirmPaymentAndDeliver={handleConfirmPaymentAndDeliver}
            />
          </div>
        )}
      </div>
    </div>
  );
};

DeliveryTaskCard.propTypes = {
  task: PropTypes.shape({
    type: PropTypes.string,
    reason: PropTypes.string,
    orderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    assignmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    paymentMethod: PropTypes.string,
    cashToCollect: PropTypes.number,
    date: PropTypes.string,
    updatedAt: PropTypes.string,
    customerName: PropTypes.string,
    phone: PropTypes.string,
    address: PropTypes.shape({
      addressLine1: PropTypes.string,
      area: PropTypes.string,
      city: PropTypes.string,
      state: PropTypes.string,
    }),
    items: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        quantity: PropTypes.number,
        returnReason: PropTypes.string,
        Product: PropTypes.shape({
          name: PropTypes.string,
        }),
      }),
    ),
  }).isRequired,
  activeTab: PropTypes.string.isRequired,
  onStatusUpdate: PropTypes.func.isRequired,
};

export default DeliveryTaskCard;
