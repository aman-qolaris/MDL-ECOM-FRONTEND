/* eslint-disable react/prop-types */

const StockUpdateModal = ({
  editingProduct,
  newWarehouseStock,
  setNewWarehouseStock,
  errorMsg,
  setErrorMsg,
  onClose,
  onSave,
}) => {
  if (!editingProduct) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-96 animate-fadeIn">
        <h3 className="text-xl font-bold mb-2 text-gray-800 border-b pb-2">
          Update Warehouse Stock
        </h3>

        <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
          <p className="flex justify-between mb-1">
            <span>Vendor Total Stock:</span>
            <span className="font-bold">{editingProduct.totalStock || 0}</span>
          </p>
          <p className="flex justify-between">
            <span>Current Warehouse:</span>
            <span className="font-bold text-purple-700">
              {editingProduct.warehouseStock || 0}
            </span>
          </p>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          New Warehouse Quantity
        </label>
        <input
          type="number"
          value={newWarehouseStock}
          onChange={(e) => {
            setNewWarehouseStock(e.target.value);
            if (setErrorMsg) setErrorMsg("");
          }}
          className={`w-full border p-2 rounded-lg mb-2 focus:ring-2 outline-none transition ${
            errorMsg
              ? "border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:ring-blue-500"
          }`}
          min="0"
          autoFocus
        />

        {errorMsg && (
          <p className="text-xs text-red-600 font-medium mb-4">{errorMsg}</p>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md"
          >
            Save Updates
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockUpdateModal;
