import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getFeaturedProducts } from "../../store/thunks/productThunks";
import ProductCard from "../common/ProductCard";
import { FaStar, FaArrowRight } from "react-icons/fa";
import { dummyProducts } from "../../data/dummyData";

const FeaturedProducts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featured, loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(getFeaturedProducts());
  }, [dispatch]);

  // Use dummy data if API fails or is empty (for design purpose)
  const displayProducts =
    featured.length > 0 ? featured : dummyProducts.slice(0, 4);

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <FaStar className="text-yellow-500" /> Featured Collection
            </h2>
            <p className="text-gray-500 mt-2">Handpicked items just for you</p>
          </div>

          <button
            onClick={() => navigate("/shop")}
            className="group flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition"
          >
            View All
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Content State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        ) : error ? (
          // Show dummy data on error so UI doesn't look broken
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
