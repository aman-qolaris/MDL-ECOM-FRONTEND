import { useCallback, useEffect, useMemo, useState } from "react";
import { getProductById } from "../../../services/productService";
import { getOrderById } from "../../../services/orderService";

export function useOrderDetails(initialOrder) {
  const [order, setOrder] = useState(initialOrder);
  const [enrichedItems, setEnrichedItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  const refreshOrder = useCallback(async () => {
    if (!order?.id) return null;
    const freshData = await getOrderById(order.id);
    setOrder(freshData);
    return freshData;
  }, [order?.id]);

  useEffect(() => {
    if (!initialOrder?.id) return;

    const fetchFreshOrder = async () => {
      try {
        const freshData = await getOrderById(initialOrder.id);
        setOrder(freshData);
      } catch (error) {
        console.error("Failed to fetch fresh order data:", error);
      }
    };

    fetchFreshOrder();
  }, [initialOrder?.id]);

  useEffect(() => {
    let cancelled = false;

    const fetchProductDetails = async () => {
      if (!order) return;
      const rawItems = order.OrderItems || order.items || [];
      setLoadingItems(true);

      try {
        const itemPromises = rawItems.map(async (item) => {
          if (
            !item.Product ||
            (!item.Product.imageUrl &&
              (!item.Product.images || item.Product.images.length === 0))
          ) {
            try {
              const productData = await getProductById(item.productId);
              return { ...item, Product: productData };
            } catch (error) {
              console.error(`Failed to fetch product ${item.productId}`, error);
              return item;
            }
          }
          return item;
        });

        const completedItems = await Promise.all(itemPromises);
        if (!cancelled) setEnrichedItems(completedItems);
      } catch (error) {
        console.error("Error enriching order items:", error);
      } finally {
        if (!cancelled) setLoadingItems(false);
      }
    };

    fetchProductDetails();

    return () => {
      cancelled = true;
    };
  }, [order]);

  const isOrderActive = useMemo(() => {
    return (
      order?.status === "PROCESSING" ||
      order?.status === "PENDING" ||
      order?.status === "PARTIALLY_CANCELLED"
    );
  }, [order?.status]);

  const isReturnable = useCallback((item) => {
    if (item.status !== "DELIVERED") return false;
    if (item.returnStatus !== "NONE") return false;

    const deliveryDate = new Date(item.updatedAt);
    const now = new Date();
    const diffTime = Math.abs(now - deliveryDate);
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    return diffHours <= 48;
  }, []);

  const canReturnOrder = useMemo(() => {
    return enrichedItems.some((item) => isReturnable(item));
  }, [enrichedItems, isReturnable]);

  return {
    order,
    setOrder,
    enrichedItems,
    loadingItems,
    refreshOrder,
    isOrderActive,
    isReturnable,
    canReturnOrder,
  };
}
