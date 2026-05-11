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

      const vendorsList = Array.isArray(vendorsData)
        ? vendorsData
        : vendorsData?.rows || [];

      setVendors(vendorsList.filter((v) => v.status === "APPROVED"));

      const productsList = Array.isArray(productsData)
        ? productsData
        : productsData?.rows || [];

      const stats = {};

      productsList.forEach((product) => {
        if (product.vendorId) {
          if (!stats[product.vendorId]) {
            stats[product.vendorId] = { count: 0, stock: 0 };
          }

          stats[product.vendorId].count += 1;

          const stockQty = product.totalStock || 0;
          stats[product.vendorId].stock += stockQty;
        }
      });
      setInventoryStats(stats);
    } catch (err) {
      console.error("Failed to load inventory data", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter((v) =>
    v.businessName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) return <div className="p-6">Loading inventory...</div>;

  return (
    <div className="animate-fadeIn p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 text-gray-600 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
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
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-4">
                <button
                  type="button"
                  className="flex items-center gap-3 cursor-pointer group text-left focus:outline-none focus:ring-2 focus:ring-blue-300 rounded p-1 -ml-1"
                  onClick={() =>
                    navigate(`/admin/vendors/${vendor.id}`, {
                      state: { vendor },
                    })
                  }
                  title="View Vendor Details"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl group-hover:bg-blue-200 transition">
                    <FaStore />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition">
                      {vendor.businessName}
                    </h3>
                    <p className="text-sm text-gray-500">{vendor.name}</p>
                  </div>
                </button>

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
                    className="text-green-600 hover:text-green-800 font-medium text-sm transition flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-green-200 rounded px-1"
                  >
                    <FaChartLine /> Sales
                  </Link>

                  {/* Inventory Button (Points to dynamic page) */}
                  <Link
                    to={`/admin/inventory/vendor/${vendor.id}`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-200 rounded px-1"
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
