import { useSelector } from "react-redux";
import { selectCartQuantityByProductId } from "../store/slices/cartSlice";

export default function useCartQuantity(productId) {
  return useSelector((state) =>
    selectCartQuantityByProductId(state, productId)
  );
}
