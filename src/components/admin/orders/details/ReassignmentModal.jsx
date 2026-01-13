/* eslint-disable react/prop-types */
import { FaTimes, FaExchangeAlt } from "react-icons/fa";

const ReassignmentModal = ({
  isOpen,
  onClose,
  loading,
  options,
  selectedBoy,
  onSelectBoy,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        <div className="bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <FaExchangeAlt className="text-blue-600" /> Reassign Partner
          </h3>
          <button onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <p>Loading...</p>
          ) : (
            options.map((boy) => (
              <div
                key={boy.id}
                onClick={() => onSelectBoy(boy)}
                className={`p-3 border mb-2 cursor-pointer ${
                  selectedBoy?.id === boy.id ? "bg-blue-50 border-blue-500" : ""
                }`}
              >
                <p className="font-bold">{boy.name}</p>
                <p className="text-xs">{boy.currentLoad} Active Orders</p>
              </div>
            ))
          )}
        </div>
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onConfirm}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReassignmentModal;
