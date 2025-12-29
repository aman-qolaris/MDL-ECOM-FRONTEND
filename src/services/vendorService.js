import api from "./api";

// Fetch all vendors (Pending, Approved, Rejected)
export const getAllVendors = async () => {
  const response = await api.get("/admin/vendors");
  return response.data;
};

// Approve a vendor
export const approveVendor = async (vendorId) => {
  const response = await api.put(`/admin/vendors/${vendorId}/approve`);
  return response.data;
};

// Reject a vendor
export const rejectVendor = async (vendorId) => {
  const response = await api.put(`/admin/vendors/${vendorId}/reject`);
  return response.data;
};
