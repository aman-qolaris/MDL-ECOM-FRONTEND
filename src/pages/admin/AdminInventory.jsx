import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllVendors } from "../../services/vendorService";
import { getProducts } from "../../services/productService";
import {
  FaStore,
  FaBox,
  FaArrowRight,
  FaSearch,
  FaChartLine,
  FaArrowLeft,
} from "react-icons/fa";

const AdminInventory = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [inventoryStats, setInventoryStats] = useState({}); // Stores both count & stock
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vendorsData, productsData] = await Promise.all([
        getAllVendors(),
        getProducts(),
      ]);

      // Only show Approved vendors
      setVendors(vendorsData.filter((v) => v.status === "APPROVED"));

      // Calculate stats (Count + Total Stock)
      const stats = {};
      productsData.forEach((product) => {
        if (product.vendorId) {
          if (!stats[product.vendorId]) {
            stats[product.vendorId] = { count: 0, stock: 0 };
          }

          // 1. Increment Product Count
          stats[product.vendorId].count += 1;

          // 2. Add Stock (Check new stockDetails structure first, fallback to vendortotalstock)
          const stockQty = product.totalStock || 0;
          stats[product.vendorId].stock += stockQty;
        }
      });
      setInventoryStats(stats);
    } catch (err) {
      console.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter((v) =>
    v.businessName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-6">Loading inventory...</div>;

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
          <FaBox /> Inventory Management
        </h2>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search Vendor Business Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => {
          const stats = inventoryStats[vendor.id] || { count: 0, stock: 0 };

          return (
            <div
              key={vendor.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                    <FaStore />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {vendor.businessName}
                    </h3>
                    <p className="text-sm text-gray-500">{vendor.name}</p>
                  </div>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  ID: {vendor.id}
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 pt-4 gap-2">
                <div className="text-sm text-gray-600">
                  <span className="font-bold text-gray-900">{stats.count}</span>{" "}
                  Products
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="font-bold text-gray-900">
                    {stats.stock}
                  </span>{" "}
                  Units
                </div>

                <div className="flex gap-3">
                  {/* Sales Button */}
                  <Link
                    to={`/admin/inventory/vendor/${vendor.id}/sales`}
                    className="text-green-600 hover:text-green-800 font-medium text-sm transition flex items-center gap-1"
                  >
                    <FaChartLine /> Sales
                  </Link>

                  {/* Inventory Button (Points to dynamic page) */}
                  <Link
                    to={`/admin/inventory/vendor/${vendor.id}`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition"
                  >
                    Inventory <FaArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminInventory;
