import { useEffect, useState } from "react";
import { getAdminStats } from "../../services/adminService"; // Import the new service
import { getProducts } from "../../services/productService"; // Import product service to get count
import {
  FaShoppingCart,
  FaUserFriends,
  FaBoxOpen,
  FaRupeeSign,
} from "react-icons/fa";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch Admin Stats and Products in parallel
      const [adminData, productsData] = await Promise.all([
        getAdminStats(),
        getProducts(),
      ]);

      setStats({
        totalRevenue: adminData.stats.totalRevenue || 0,
        totalOrders: adminData.stats.totalOrders || 0,
        activeUsers: adminData.stats.activeUsers || 0,
        totalProducts: productsData.length || 0, // Calculate product count from array length
      });
    } catch (err) {
      console.error("Dashboard data fetch failed:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Dashboard Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Stat Cards with Dynamic Data */}
        {[
          {
            label: "Total Sales",
            value: `₹${stats.totalRevenue.toLocaleString()}`,
            color: "bg-green-500",
            icon: <FaRupeeSign className="text-white opacity-80 text-3xl" />,
          },
          {
            label: "Total Orders",
            value: stats.totalOrders,
            color: "bg-blue-500",
            icon: <FaShoppingCart className="text-white opacity-80 text-3xl" />,
          },
          {
            label: "Products",
            value: stats.totalProducts,
            color: "bg-purple-500",
            icon: <FaBoxOpen className="text-white opacity-80 text-3xl" />,
          },
          {
            label: "Customers",
            value: stats.activeUsers,
            color: "bg-orange-500",
            icon: <FaUserFriends className="text-white opacity-80 text-3xl" />,
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden flex items-center justify-between"
          >
            <div
              className={`absolute top-0 left-0 h-full w-1 ${stat.color}`}
            ></div>

            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stat.value}
              </p>
            </div>

            <div
              className={`p-3 rounded-full ${stat.color.replace(
                "bg-",
                "bg-opacity-20 bg-"
              )}`}
            >
              {/* Icon Container with matching color tint */}
              <div className={`text-${stat.color.split("-")[1]}-600`}>
                {/* You can render the icon passed in the object if you want to be specific, 
                     or just use the background color logic */}
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
