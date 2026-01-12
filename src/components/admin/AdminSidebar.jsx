import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBox,
  FaShoppingBag,
  FaUsers,
  FaSignOutAlt,
  FaCog,
  FaStore,
  FaTruck,
  FaMoneyBillWave,
  FaClipboardList,
  FaUndo,
} from "react-icons/fa";

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate(); // ✅ Use hook

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/admin/dashboard", name: "Dashboard", icon: <FaTachometerAlt /> },
    { path: "/admin/inventory", name: "Inventory", icon: <FaBox /> },
    { path: "/admin/orders", name: "Orders", icon: <FaShoppingBag /> },
    {
      path: "/admin/assigned-orders",
      name: "Assigned Orders",
      icon: <FaClipboardList />,
    },
    { path: "/admin/returns", name: "Return Requests", icon: <FaUndo /> },
    { path: "/admin/vendors", name: "Vendors", icon: <FaStore /> },
    { path: "/admin/delivery-boys", name: "Delivery Boys", icon: <FaTruck /> },
    {
      path: "/admin/cod-reconciliation",
      name: "COD Reconciliation",
      icon: <FaMoneyBillWave />,
    },
    { path: "/admin/users", name: "Users", icon: <FaUsers /> },
    { path: "/admin/settings", name: "Settings", icon: <FaCog /> },
  ];

  // ✅ New Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col transition-all duration-300">
      {/* Brand */}
      <div className="h-16 flex items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold tracking-wider">ADMIN PANEL</h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-6 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 px-6 py-3 transition-colors ${
              isActive(item.path)
                ? "bg-blue-600 text-white border-r-4 border-blue-400"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout} // ✅ Attach new handler
          className="flex items-center gap-4 px-6 py-3 text-red-400 hover:bg-gray-800 hover:text-red-300 w-full rounded-lg transition"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
