import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts } from "../store/thunks/productThunks";
// 1. Import optimized selector
import { selectAllProducts } from "../store/slices/productSlice";

// === 1. YOUR ORIGINAL COMPONENTS ===
import Hero from "../components/home/Hero";
import TrustValues from "../components/home/TrustValues";
import FeaturedProducts from "../components/home/FeaturedProducts";
import RecentlyViewed from "../components/home/RecentlyViewed";

// === 2. NEW MODERN COMPONENTS ===
import CategoryShowcase from "../components/home/CategoryShowcase";
import ProductCollection from "../components/home/ProductCollection";
import DealsOfTheDay from "../components/home/DealsOfTheDay";
import CustomerTestimonials from "../components/home/CustomerTestimonials";

// Fallback Data
import { dummyProducts } from "../data/dummyData";

const Home = () => {
  const dispatch = useDispatch();

  // 2. Use specific selector
  const items = useSelector(selectAllProducts);

  useEffect(() => {
    dispatch(getAllProducts());
  }, [dispatch]);

  // Use real data if available, else dummy data
  const allProducts = items.length > 0 ? items : dummyProducts;

  // 3. OPTIMIZATION: useMemo for derived lists.
  // Especially important for 'trendingProducts' because Math.random()
  // causes the list to shuffle on every single re-render (bad UX).
  const { trendingProducts, newArrivals } = useMemo(() => {
    return {
      trendingProducts: [...allProducts]
        .sort(() => 0.5 - Math.random())
        .slice(0, 4),
      newArrivals: [...allProducts].reverse().slice(0, 4),
    };
  }, [allProducts]);

  return (
    <div className="bg-white min-h-screen">
      {/* 1. HERO SECTION */}
      <Hero />

      {/* 3. CATEGORIES */}
      <CategoryShowcase />

      {/* 4. FEATURED PRODUCTS */}
      <div className="bg-gray-50/50 border-y border-gray-100">
        <FeaturedProducts />
      </div>

      {/* 10. RECENTLY VIEWED */}
      <RecentlyViewed />

      {/* 5. TRENDING NOW */}
      <ProductCollection
        title="Trending Now"
        subtitle="The hottest picks from our community"
        products={trendingProducts}
      />

      {/* 6. DEALS OF THE DAY */}
      <DealsOfTheDay />

      {/* 9. NEW ARRIVALS */}
      <ProductCollection
        title="New Arrivals"
        subtitle="Be the first to own our latest drops"
        products={newArrivals}
      />

      {/* 11. TESTIMONIALS */}
      <CustomerTestimonials />

      {/* 12. TRUST VALUES */}
      <TrustValues />
    </div>
  );
};

export default Home;
