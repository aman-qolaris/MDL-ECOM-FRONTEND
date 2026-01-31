// src/pages/vendor/VendorDashboard.jsx
import React, { useEffect, useState } from "react";
import { getVendorStats } from "../../services/orderService"; // 🟢 Import the service
import { 
  FaMoneyBillWave, 
  FaShoppingCart, 
  FaClock, 
  FaUndo, 
  FaBoxOpen 
} from "react-icons/fa";
import { Link } from "react-router-dom";

const VendorDashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    todayOrders: 0,
    returnsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // 🟢 CALLING THE NEW BACKEND ENDPOINT
      const data = await getVendorStats(); 
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch vendor stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Card Configuration
  const cards = [
   // ... inside your cards array ...
    {
      title: "Total Revenue",
      value: `₹${parseFloat(stats.totalSales).toLocaleString()}`,
      icon: <FaMoneyBillWave />,
      color: "bg-green-500",
      // 🟢 CHANGE THIS LINK: Add '?filter=revenue'
      link: "/vendor/orders?filter=revenue", 
      desc: "Net earnings (Excl. Returns)"
    },
// ...,
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <FaShoppingCart />,
      color: "bg-blue-500",
      link: "/vendor/orders",
      desc: "All time orders"
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: <FaClock />,
      color: "bg-orange-500",
      link: "/vendor/orders?filter=pending",
      desc: "Orders needing action"
    },
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      icon: <FaBoxOpen />,
      color: "bg-indigo-500",
      link: "/vendor/orders?filter=today",
      desc: "Orders received today"
    },
    {
      title: "Return Requests",
      value: stats.returnsCount,
      icon: <FaUndo />,
      color: "bg-red-500",
      link: "/vendor/orders?filter=returns",
      desc: "Active return requests"
    }
  ];

  if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Vendor Dashboard</h1>
      <p className="text-gray-500 mb-8">Welcome back! Here is your business overview.</p>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <Link 
            to={card.link} 
            key={index}
            className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">
                  {card.title}
                </p>
                <h3 className="text-3xl font-extrabold text-gray-800 mt-2">
                  {card.value}
                </h3>
                <p className="text-xs text-gray-500 mt-2 font-medium">
                  {card.desc}
                </p>
              </div>
              <div className={`p-4 rounded-full text-white shadow-lg ${card.color}`}>
                <span className="text-xl">{card.icon}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default VendorDashboard;