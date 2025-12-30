import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFeaturedProducts } from "../store/thunks/productThunks";

// Components
import Hero from "../components/home/Hero";
import CreativeFilters from "../components/home/CreativeFilters";
import RecentlyViewed from "../components/home/RecentlyViewed";
import FeaturedProducts from "../components/home/FeaturedProducts";
import TrustValues from "../components/home/TrustValues";
import PromoBanner from "../components/home/PromoBanner";

const Home = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getFeaturedProducts());
  }, [dispatch]);

  return (
    <div className="space-y-16 pb-10">
      {/* 1. Hero Section */}
      <div className="animate-fadeIn">
        <Hero />
      </div>

      {/* 2. Trust Values (Floating Glass Strip) */}
      <div className="glass-panel rounded-2xl p-6 mx-2 md:mx-0 animate-slideUp">
        <TrustValues />
      </div>

      {/* 3. Filters & Banner */}
      <div className="space-y-10">
        <CreativeFilters />

        <div className="transform hover:scale-[1.01] transition-transform duration-500">
          <PromoBanner />
        </div>
      </div>

      {/* 4. Featured Products (FIXING THE BLANK SPACE HERE) */}
      {/* We wrap the product grid in a glass-panel so it stands out */}
      <section className="glass-panel rounded-3xl p-8 animate-slideUp">
        {/* FeaturedProducts component handles the grid inside */}
        <FeaturedProducts />
      </section>

      {/* 5. Recently Viewed */}
      <div className="animate-slideUp">
        <RecentlyViewed />
      </div>
    </div>
  );
};

export default Home;
