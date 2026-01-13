/* eslint-disable react/prop-types */
import { FaArrowLeft, FaBoxOpen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const InventoryHeader = ({ vendorName }) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/inventory")}
          className="p-2 rounded-full hover:bg-gray-200 transition text-gray-600"
          title="Back to Vendors"
        >
          <FaArrowLeft />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaBoxOpen className="text-blue-600" />
            {vendorName ? `${vendorName}'s Inventory` : "Vendor Inventory"}
          </h2>
          <p className="text-sm text-gray-500">Manage Warehouse Allocation</p>
        </div>
      </div>
    </div>
  );
};

export default InventoryHeader;
