import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts } from "../store/thunks/productThunks";
import { selectAllProducts } from "../store/slices/productSlice";

// === COMPONENTS ===
import Hero from "../components/home/Hero";
import TrustValues from "../components/home/TrustValues";
import FeaturedProducts from "../components/home/FeaturedProducts";
import RecentlyViewed from "../components/home/RecentlyViewed";
import CategoryShowcase from "../components/home/CategoryShowcase";
import ProductCollection from "../components/home/ProductCollection";
import DealsOfTheDay from "../components/home/DealsOfTheDay";
import CustomerTestimonials from "../components/home/CustomerTestimonials";

// Fallback Data
import { dummyProducts } from "../data/dummyData";

const Home = () => {
  const dispatch = useDispatch();

  // Redux Selectors
  const items = useSelector(selectAllProducts);

  useEffect(() => {
    dispatch(getAllProducts());
  }, [dispatch]);

  // Use real data if available, else dummy data
  const allProducts = items.length > 0 ? items : dummyProducts;

  // --- LOGIC: Group Products & Calculate Derived Lists ---
  const { trendingProducts, newArrivals, categoryRows } = useMemo(() => {
    // 1. Trending & New Arrivals
    const trending = [...allProducts]
      .sort(() => 0.5 - Math.random())
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
  }, [allProducts]);

  return (
    <div className="bg-gray-100 min-h-screen overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <Hero />

      {/* 2. SHOP BY CATEGORY (Icons) */}
      <CategoryShowcase />

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

      {/* 8. RECENTLY VIEWED */}
      <RecentlyViewed />

      {/* 9. TESTIMONIALS */}
      <CustomerTestimonials />

      {/* 10. TRUST VALUES */}
      <TrustValues />
    </div>
  );
};

export default Home;
