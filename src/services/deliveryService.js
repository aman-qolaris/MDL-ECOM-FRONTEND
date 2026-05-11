import api from "./api"; // Import your custom axios instance

// --- DELIVERY PROFILE & SECURITY ---

export const getDeliveryProfile = async () => {
  // Fetches the delivery boy profile (excluding password)
  const response = await api.get("/orders/delivery/profile");
  return response.data;
};

export const changeDeliveryPassword = async (passwordData) => {
  // passwordData expects { oldPassword, newPassword } matching your backend
  const response = await api.put(
    "/orders/delivery/change-password",
    passwordData,
  );
  return response.data;
};

export const loginDeliveryBoy = async (credentials) => {
  const response = await api.post("/orders/delivery/login", credentials);
  return response.data;
};
