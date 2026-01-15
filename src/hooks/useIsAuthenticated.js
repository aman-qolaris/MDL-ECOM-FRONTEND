import { useSelector } from "react-redux";

export default function useIsAuthenticated() {
  return useSelector((state) => state.auth.isAuthenticated);
}
