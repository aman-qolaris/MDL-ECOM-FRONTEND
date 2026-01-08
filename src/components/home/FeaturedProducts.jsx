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

  const displayProducts =
    featured.length > 0 ? featured : dummyProducts.slice(0, 4);

  return (
    <section className="relative py-20">
      {/* Background Accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/70 via-white to-white pointer-events-none" />

      <div className="relative container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <span className="inline-block mb-3 text-indigo-600 font-bold tracking-widest uppercase text-sm">
              Featured
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Featured Collection
            </h2>
            <p className="text-gray-500 mt-3 text-lg max-w-xl">
              Handpicked premium products curated to elevate your shopping
              experience.
            </p>
          </div>

          <button
            onClick={() => navigate("/shop")}
            className="group inline-flex items-center gap-3 px-7 py-3 rounded-full bg-white border border-gray-200 font-semibold text-gray-700 shadow-sm hover:bg-gray-900 hover:text-white hover:shadow-lg transition-all duration-300"
          >
            View All
            <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Product Grid / Loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-[360px] rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayProducts.map((product) => (
              <div
                key={product.id}
                className="transform transition duration-300 hover:-translate-y-1"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
