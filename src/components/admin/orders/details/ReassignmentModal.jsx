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
      <button
        type="button"
        className="absolute inset-0 w-full h-full border-none bg-black/40 backdrop-blur-md cursor-default focus:outline-none"
        onClick={onClose}
        aria-label="Close modal background"
      ></button>

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        <div className="bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <FaExchangeAlt className="text-blue-600" /> Reassign Partner
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 rounded p-1"
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {loading ? (
            <p className="text-gray-500 text-center py-4">
              Loading partners...
            </p>
          ) : (
            options.map((boy) => (
              <button
                type="button"
                key={boy.id}
                onClick={() => onSelectBoy(boy)}
                className={`w-full text-left p-3 border mb-2 cursor-pointer rounded-lg transition-colors outline-none focus:ring-2 focus:ring-blue-500 ${
                  selectedBoy?.id === boy.id
                    ? "bg-blue-50 border-blue-500"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <p className="font-bold text-gray-800">{boy.name}</p>
                <p className="text-xs text-gray-500">
                  {boy.currentLoad} Active Orders
                </p>
              </button>
            ))
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!selectedBoy}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReassignmentModal;
