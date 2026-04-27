import { useEffect, useState } from "react";
import {
  getAllVendors,
  approveVendor,
  rejectVendor,
} from "../../services/vendorService";
import { getProducts } from "../../services/productService"; // 👈 1. ADD THIS IMPORT
import {
  FaCheck,
  FaTimes,
  FaStore,
  FaUserTie,
  FaBox,
  FaArrowLeft,
  FaEye,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminVendors = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [inventoryCounts, setInventoryCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filter, setFilter] = useState("all"); // Options: 'all' or 'pending'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vendorsData, productsData] = await Promise.all([
        getAllVendors(),
        getProducts(),
      ]);

      const vendorsList = Array.isArray(vendorsData)
        ? vendorsData
        : vendorsData?.rows || [];
      const productsList = Array.isArray(productsData)
        ? productsData
        : productsData?.rows || [];

      setVendors(vendorsList);

      const counts = {};
      productsList.forEach((product) => {
        if (product.vendorId) {
          counts[product.vendorId] = (counts[product.vendorId] || 0) + 1;
        }
      });
      setInventoryCounts(counts);
    } catch (err) {
      console.error("AdminVendors fetch error:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === "approve") {
        await approveVendor(id);
      } else {
        await rejectVendor(id);
      }
      // Refresh list
      loadData();
    } catch (err) {
      alert(`Failed to ${action} vendor`);
    }
  };

  // 👇 2. ADD THIS FILTER LOGIC
  const filteredVendors = vendors.filter((vendor) => {
    if (filter === "pending") return vendor.status === "PENDING";
    return true; // Show all
  });

  if (loading) return <div className="p-6">Loading vendors...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 text-gray-600 transition shadow-sm"
        >
          <FaArrowLeft size={16} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaStore /> Vendor Verification
        </h2>
      </div>
      {/* 👇 3. ADD THESE BUTTONS HERE */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === "all"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          All Vendors
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            filter === "pending"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Pending Requests
          {/* Optional: Show count badge */}
          <span className="bg-yellow-400 text-yellow-900 text-xs py-0.5 px-2 rounded-full">
            {vendors.filter((v) => v.status === "PENDING").length}
          </span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 uppercase text-sm">
              <th className="py-3 px-6">ID</th>
              <th className="py-3 px-6">Business Name</th>
              <th className="py-3 px-6">Owner</th>
              <th className="py-3 px-6">Email / Phone</th>
              <th className="py-3 px-6 text-center">Inventory</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {filteredVendors.map((vendor) => {
              // 🟢 1. Define the navigation function
              const navigateToDetails = () => {
                navigate(`/admin/vendors/${vendor.id}`, { state: { vendor } });
              };

              return (
                <tr
                  key={vendor.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  {/* 🟢 2. Add onClick and cursor-pointer to the data columns */}
                  <td
                    onClick={navigateToDetails}
                    className="py-3 px-6 font-mono cursor-pointer hover:text-blue-600"
                  >
                    #{vendor.id}
                  </td>
                  <td
                    onClick={navigateToDetails}
                    className="py-3 px-6 font-medium text-gray-800 cursor-pointer hover:text-blue-600"
                  >
                    {vendor.businessName}
                  </td>
                  <td
                    onClick={navigateToDetails}
                    className="py-3 px-6 flex items-center gap-2 cursor-pointer hover:text-blue-600"
                  >
                    <FaUserTie className="text-gray-400" /> {vendor.name}
                  </td>
                  <td
                    onClick={navigateToDetails}
                    className="py-3 px-6 cursor-pointer hover:text-blue-600"
                  >
                    <div>{vendor.email}</div>
                    <div className="text-xs text-gray-400">{vendor.phone}</div>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-700 font-medium">
                      <FaBox className="text-blue-500" />
                      <span>{inventoryCounts[vendor.id] || 0} Items</span>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        vendor.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : vendor.status === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {vendor.status}
                    </span>
                  </td>

                  {/* 🟢 3. Remove the Eye button from Actions. Only keep Approve/Reject */}
                  <td className="py-3 px-6 text-center">
                    {vendor.status === "PENDING" && (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleAction(vendor.id, "approve")}
                          className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200 cursor-pointer"
                          title="Approve"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => handleAction(vendor.id, "reject")}
                          className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 cursor-pointer"
                          title="Reject"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    )}
                    {vendor.status !== "PENDING" && (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredVendors.length === 0 && (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500">
                  No vendors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminVendors;
