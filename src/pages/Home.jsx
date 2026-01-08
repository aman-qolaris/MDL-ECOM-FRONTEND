import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts } from "../store/thunks/productThunks";

// === 1. YOUR ORIGINAL COMPONENTS ===
import Hero from "../components/home/Hero";
import TrustValues from "../components/home/TrustValues";
import FeaturedProducts from "../components/home/FeaturedProducts"; // ✅ Added back
import RecentlyViewed from "../components/home/RecentlyViewed"; // ✅ Added back

// === 2. NEW MODERN COMPONENTS ===
import CategoryShowcase from "../components/home/CategoryShowcase";
import ProductCollection from "../components/home/ProductCollection";
import DealsOfTheDay from "../components/home/DealsOfTheDay";
import CustomerTestimonials from "../components/home/CustomerTestimonials";

// Fallback Data
import { dummyProducts } from "../data/dummyData";

const Home = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(getAllProducts());
  }, [dispatch]);

  // Use real data if available, else dummy data
  const allProducts = items.length > 0 ? items : dummyProducts;

  // Create derived lists for specific sections
  const trendingProducts = [...allProducts]
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);
  const newArrivals = [...allProducts].reverse().slice(0, 4);

  return (
    <div className="bg-white min-h-screen">
      {/* 1. HERO SECTION (Main Banner) */}
      <Hero />

      {/* 3. CATEGORIES (Visual Navigation) */}
      <CategoryShowcase />

      {/* 4. FEATURED PRODUCTS (Your Original Component - Priority Display) */}
      {/* This uses your specific 'featured' logic from Redux */}
      <div className="bg-gray-50/50 border-y border-gray-100">
        <FeaturedProducts />
      </div>

      {/* 10. RECENTLY VIEWED (Personalization) */}
      {/* Great to place here: "Did you forget this?" before footer */}
      <RecentlyViewed />

      {/* 5. TRENDING NOW (Discovery) */}
      <ProductCollection
        title="Trending Now"
        subtitle="The hottest picks from our community"
        products={trendingProducts}
      />

      {/* 6. DEALS OF THE DAY (Urgency & Promotion) */}
      <DealsOfTheDay />

      {/* 9. NEW ARRIVALS (Fresh Content) */}
      <ProductCollection
        title="New Arrivals"
        subtitle="Be the first to own our latest drops"
        products={newArrivals}
      />

      {/* 11. TESTIMONIALS (Social Proof) */}
      <CustomerTestimonials />

      {/* 12. TRUST VALUES (Footer Assurance) */}
      <TrustValues />
    </div>
  );
};

export default Home;
