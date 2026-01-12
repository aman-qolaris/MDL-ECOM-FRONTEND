import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBoxOpen,
  FaClipboardList,
  FaRupeeSign,
  FaClock,
  FaCalendarDay,
} from "react-icons/fa";
import { getVendorDashboardStats } from "../../services/vendorService";
import StatsCard from "../../components/common/StatsCard";
import Skeleton from "../../components/ui/Skeleton";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getVendorDashboardStats();
        setStats(data);
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate("/vendor/login");
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  const cards = [
    {
      title: "Total Sales",
      value: (val) => `₹${val?.toLocaleString()}`,
      dataKey: "totalSales",
      icon: <FaRupeeSign />,
      color: "bg-green-500",
      link: "/vendor/sales",
      desc: "View Sales Reports",
    },
    {
      title: "Total Orders",
      dataKey: "totalOrders",
      icon: <FaClipboardList />,
      color: "bg-blue-500",
      link: "/vendor/order-stats",
      desc: "View Order Stats",
    },
    {
      title: "My Products",
      dataKey: "productCount",
      icon: <FaBoxOpen />,
      color: "bg-purple-500",
      link: "/vendor/products",
      desc: "Manage Inventory",
    },
    {
      title: "Today's Orders",
      dataKey: "todayOrders",
      icon: <FaCalendarDay />,
      color: "bg-orange-500",
      link: "/vendor/orders?filter=today",
      desc: "Orders received today",
    },
    {
      title: "Pending Orders",
      dataKey: "pendingOrders",
      icon: <FaClock />,
      color: "bg-red-500",
      link: "/vendor/orders?filter=pending",
      desc: "Actions required",
    },
  ];

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Dashboard Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-32 bg-white rounded-xl border border-gray-200 p-6 flex gap-4"
              >
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-8 w-3/4" />
                </div>
              </div>
            ))
          : cards.map((card, index) => (
              <StatsCard
                key={index}
                title={card.title}
                value={
                  card.value
                    ? card.value(stats[card.dataKey])
                    : stats[card.dataKey]
                }
                icon={card.icon}
                color={card.color}
                link={card.link}
                desc={card.desc}
              />
            ))}
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          Welcome back to your Vendor Portal
        </h3>
        <p className="text-gray-500">
          Select a card above to view detailed reports or manage your store.
        </p>
      </div>
    </div>
  );
};

export default VendorDashboard;
