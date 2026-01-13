/* eslint-disable react/prop-types */
import { FaTimes, FaCloudUploadAlt } from "react-icons/fa";

const EditProductModal = ({
  isOpen,
  onClose,
  onSubmit,
  editData,
  setEditData,
  handleFileChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all animate-fadeIn">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800">Edit Product</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div className="flex flex-col items-center mb-4">
            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 mb-3 relative group">
              <img
                src={editData.previewUrl || "https://via.placeholder.com/150"}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <label className="cursor-pointer text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
              <FaCloudUploadAlt /> Change Image
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Price (₹)
            </label>
            <input
              type="number"
              required
              value={editData.price}
              onChange={(e) =>
                setEditData({ ...editData, price: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Total Stock
            </label>
            <input
              type="number"
              required
              value={editData.stock}
              onChange={(e) =>
                setEditData({ ...editData, stock: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-md transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
