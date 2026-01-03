import api from "./api";

// Fetch Dashboard Stats (Revenue, Orders, Users)
// Backend: GET /api/admin/dashboard/stats
export const getAdminStats = async () => {
  const response = await api.get("/admin/dashboard/stats");
  return response.data;
};
