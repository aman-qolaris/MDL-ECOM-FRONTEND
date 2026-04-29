import api from "./api"; // Import your custom axios instance

// --- DELIVERY PROFILE & SECURITY ---

export const getDeliveryProfile = async () => {
  try {
    // Fetches the delivery boy profile (excluding password)
    const response = await api.get("/orders/delivery/profile");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const changeDeliveryPassword = async (passwordData) => {
  try {
    // passwordData expects { oldPassword, newPassword } matching your backend
    const response = await api.put(
      "/orders/delivery/change-password",
      passwordData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const loginDeliveryBoy = async (credentials) => {
  try {
    const response = await api.post("/orders/delivery/login", credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};
