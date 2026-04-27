import { Suspense, lazy, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts } from "../store/thunks/productThunks";
import { selectAllProducts } from "../store/slices/productSlice";
import useDeferredRender from "../hooks/useDeferredRender";

// === COMPONENTS ===
import Hero from "../components/home/Hero";
import CategoryShowcase from "../components/home/CategoryShowcase";
const ProductCollection = lazy(
  () => import("../components/home/ProductCollection"),
);
const FeaturedProducts = lazy(
  () => import("../components/home/FeaturedProducts"),
);
const DealsOfTheDay = lazy(() => import("../components/home/DealsOfTheDay"));
const RecentlyViewed = lazy(() => import("../components/home/RecentlyViewed"));
const CustomerTestimonials = lazy(
  () => import("../components/home/CustomerTestimonials"),
);
const TrustValues = lazy(() => import("../components/home/TrustValues"));

const Home = () => {
  const dispatch = useDispatch();

  // Defer below-the-fold work to avoid blocking the initial render.
  const renderBelowFold = useDeferredRender();

  // Redux Selectors
  const items = useSelector(selectAllProducts);

  useEffect(() => {
    dispatch(getAllProducts());
  }, [dispatch]);

  // useDeferredRender handles idle scheduling + cleanup

  const allProducts = Array.isArray(items)
    ? items
    : items?.products || items?.data || [];
  // --- LOGIC: Group Products & Calculate Derived Lists ---
  const { trendingProducts, newArrivals, categoryRows } = useMemo(() => {
    if (!renderBelowFold) {
      return { trendingProducts: [], newArrivals: [], categoryRows: [] };
    }

    // 1. Trending & New Arrivals
    // Keep this deterministic/pure (no Math.random during render).
    // This gives a stable, "shuffled-like" ordering based on product identity.
    const score = (product) => {
      const key = String(
        product?.id ?? product?._id ?? product?.slug ?? product?.name ?? "",
      );
      let hash = 0;
      for (let i = 0; i < key.length; i += 1) {
        hash = (hash * 31 + key.charCodeAt(i)) | 0;
      }
      return hash;
    };

    const trending = [...allProducts]
      .sort((a, b) => score(b) - score(a))
      .slice(0, 4);
    const arrivals = [...allProducts].reverse().slice(0, 4);

    // 2. Group Products by Category
    const grouped = {};
    allProducts.forEach((product) => {
      // Handle backend naming (Category.name) or fallback
      const catName = product.Category?.name || product.category?.name;

      if (catName) {
        if (!grouped[catName]) {
          grouped[catName] = [];
        }
        // Add product if we have less than 4 (to keep the row neat)
        if (grouped[catName].length < 4) {
          grouped[catName].push(product);
        }
      }
    });

    // Convert grouped object to an array of sections
    const rows = Object.keys(grouped).map((name) => ({
      title: name,
      products: grouped[name],
    }));

    return {
      trendingProducts: trending,
      newArrivals: arrivals,
      categoryRows: rows,
    };
  }, [allProducts, renderBelowFold]);

  return (
    <div className="bg-gray-100 min-h-screen overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <Hero />

      {/* 2. SHOP BY CATEGORY (Icons) */}
      <CategoryShowcase />

      {/* 8. RECENTLY VIEWED */}
      <RecentlyViewed />

      {/* Defer below-the-fold sections to keep initial render fast */}
      {renderBelowFold && (
        <Suspense fallback={null}>
          {/* --- 3. DYNAMIC CATEGORY ROWS (New Section) --- */}
          {/* This renders a row for "Electronics", "Clothing", etc. */}
          {categoryRows.map((row) => (
            <ProductCollection
              key={row.title}
              title={row.title} // e.g., "Electronics"
              subtitle={`Top picks in ${row.title}`}
              products={row.products}
            />
          ))}

          {/* --- 4. TRENDING NOW (Requested Order) --- */}
          <ProductCollection
            title="Trending Now"
            subtitle="The hottest picks from our community"
            products={trendingProducts}
          />

          {/* --- 5. FEATURED PRODUCTS (Requested Order) --- */}
          <div className="bg-gray-50/50 border-y border-gray-100">
            <FeaturedProducts />
          </div>

          {/* 6. DEALS OF THE DAY */}
          <DealsOfTheDay />

          {/* 7. NEW ARRIVALS */}
          <ProductCollection
            title="New Arrivals"
            subtitle="Be the first to own our latest drops"
            products={newArrivals}
          />

          {/* 9. TESTIMONIALS */}
          <CustomerTestimonials />

          {/* 10. TRUST VALUES */}
          <TrustValues />
        </Suspense>
      )}
    </div>
  );
};

export default Home;
