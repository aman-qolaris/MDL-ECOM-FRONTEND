import api from "./api";

// Fetch Wallet Balance
// Matches Gateway Route: GET /api/auth/wallet
export const getWalletBalance = async () => {
  const response = await api.get("/auth/wallet");
  return response.data;
};
