import api from "./api";

const USE_MOCK = false; // ✅ Set to false to hit real API

// 1. GET ALL ADDRESSES
// Backend: GET /api/addresses (Gateway forwards to User Service)
export const getAddresses = async () => {
  if (USE_MOCK) return [];

  const response = await api.get("/addresses");
  return response.data;
};

// 2. ADD NEW ADDRESS
// Backend: POST /api/addresses
export const addAddress = async (addressData) => {
  if (USE_MOCK) return;

  // Gateway forwards req.body as is.
  const response = await api.post("/addresses", addressData);
  return response.data;
};

// 3. DELETE ADDRESS
// Backend: DELETE /api/addresses/:id
export const deleteAddress = async (addressId) => {
  if (USE_MOCK) return;

  const response = await api.delete(`/addresses/${addressId}`);
  return response.data;
};
