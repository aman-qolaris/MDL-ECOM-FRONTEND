import { Outlet, Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar (Fixed Left) */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm h-16 flex items-center px-3 sm:px-6 justify-end">
          {/* <--- 2. Wrap this section in a Link to /admin/settings */}
          <Link
            to="/admin/settings"
            className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-lg transition cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              A
            </div>
            <span className="font-semibold text-gray-700">Admin</span>
          </Link>
        </header>

        {/* Page Content Rendered Here */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-3 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
