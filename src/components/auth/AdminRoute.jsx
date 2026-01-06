import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  // ✅ 1. Read directly from LocalStorage
  const adminToken = localStorage.getItem("adminToken");

  // ✅ 2. Simple Check: Do we have a token?
  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  // 3. If yes, let them in
  return <Outlet />;
};

export default AdminRoute;
