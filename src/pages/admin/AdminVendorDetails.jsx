import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaUserTie,
  FaBuilding,
  FaMoneyCheckAlt,
  FaCheck,
  FaTimes,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import {
  getAllVendors,
  approveVendor,
  rejectVendor,
} from "../../services/vendorService";

const AdminVendorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [vendor, setVendor] = useState(location.state?.vendor || null);
  const [loading, setLoading] = useState(!vendor);

  useEffect(() => {
    // If accessed directly via URL (no state), fetch the vendor list and find the specific one
    if (!vendor) {
      const fetchVendor = async () => {
        try {
          const vendors = await getAllVendors();
          const foundVendor = vendors.find((v) => v.id.toString() === id);
          setVendor(foundVendor);
        } catch (error) {
          console.error("Failed to load vendor details");
        } finally {
          setLoading(false);
        }
      };
      fetchVendor();
    }
  }, [id, vendor]);

  const handleAction = async (action) => {
    try {
      if (action === "approve") await approveVendor(vendor.id);
      if (action === "reject") await rejectVendor(vendor.id);

      // Update local state to reflect change immediately
      setVendor({
        ...vendor,
        status: action === "approve" ? "APPROVED" : "REJECTED",
      });
    } catch (err) {
      alert(`Failed to ${action} vendor`);
    }
  };

  if (loading) return <div className="p-6">Loading vendor details...</div>;
  if (!vendor) return <div className="p-6 text-red-600">Vendor not found.</div>;

  return (
    <div className="animate-fadeIn max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 text-gray-600 transition shadow-sm"
          >
            <FaArrowLeft size={16} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Vendor Details</h2>
        </div>

        {/* Status Badge */}
        <span
          className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
            vendor.status === "APPROVED"
              ? "bg-green-100 text-green-700 border border-green-200"
              : vendor.status === "REJECTED"
                ? "bg-red-100 text-red-700 border border-red-200"
                : "bg-yellow-100 text-yellow-700 border border-yellow-200"
          }`}
        >
          {vendor.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Business Info Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
            <FaBuilding className="text-blue-500" /> Business Information
          </h3>
          <div className="space-y-3 text-gray-600">
            <p>
              <strong className="text-gray-800">Business Name:</strong>{" "}
              {vendor.businessName || "N/A"}
            </p>
            <p>
              <strong className="text-gray-800">Type:</strong>{" "}
              {vendor.businessType || "N/A"}
            </p>
            <p>
              <strong className="text-gray-800">Address:</strong>{" "}
              {vendor.businessAddress || "N/A"}
            </p>
            <p>
              <strong className="text-gray-800">Years in Business:</strong>{" "}
              {vendor.yearsInBusiness || 0}
            </p>
            <p>
              <strong className="text-gray-800">Description:</strong>{" "}
              {vendor.businessDescription || "None"}
            </p>
          </div>
        </div>

        {/* Personal & KYC Info Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
            <FaUserTie className="text-blue-500" /> Owner & KYC Details
          </h3>
          <div className="space-y-3 text-gray-600">
            <p>
              <strong className="text-gray-800">Name:</strong> {vendor.name}
            </p>
            <p className="flex items-center gap-2">
              <FaEnvelope className="text-gray-400" /> {vendor.email}
            </p>
            <p className="flex items-center gap-2">
              <FaPhone className="text-gray-400" /> {vendor.phone}
            </p>
            <div className="pt-2 mt-2 border-t border-gray-100">
              <p>
                <strong className="text-gray-800">Aadhar:</strong>{" "}
                {vendor.aadharNumber || "N/A"}
              </p>
              <p>
                <strong className="text-gray-800">PAN:</strong>{" "}
                {vendor.panNumber || "N/A"}
              </p>
              <p>
                <strong className="text-gray-800">GST:</strong>{" "}
                {vendor.gstNumber || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Info Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 md:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
            <FaMoneyCheckAlt className="text-blue-500" /> Financial Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-gray-600">
            <p>
              <strong className="text-gray-800 block">Bank Name</strong>{" "}
              {vendor.bankName || "N/A"}
            </p>
            <p>
              <strong className="text-gray-800 block">Account Holder</strong>{" "}
              {vendor.bankAccountHolderName || "N/A"}
            </p>
            <p>
              <strong className="text-gray-800 block">Account No</strong>{" "}
              {vendor.bankAccountNumber || "N/A"}
            </p>
            <p>
              <strong className="text-gray-800 block">IFSC Code</strong>{" "}
              {vendor.bankIFSC || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Approval Actions at the bottom if still pending */}
      {vendor.status === "PENDING" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex gap-4">
          <button
            onClick={() => handleAction("approve")}
            className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <FaCheck /> Approve Vendor
          </button>
          <button
            onClick={() => handleAction("reject")}
            className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
          >
            <FaTimes /> Reject Vendor
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminVendorDetails;
