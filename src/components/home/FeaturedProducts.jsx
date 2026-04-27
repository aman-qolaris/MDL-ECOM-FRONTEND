import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getFeaturedProducts } from "../../store/thunks/productThunks";
import {
  selectFeaturedProducts,
  selectProductLoading,
} from "../../store/slices/productSlice";
import ProductCard from "../common/ProductCard";
import { FaArrowRight, FaGem } from "react-icons/fa"; // Added FaGem icon

const FeaturedProducts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const featured = useSelector(selectFeaturedProducts);
  const loading = useSelector(selectProductLoading);

  useEffect(() => {
    dispatch(getFeaturedProducts());
  }, [dispatch]);

  const displayProducts = Array.isArray(featured)
    ? featured
    : featured?.rows || [];

  return (
    <section className="py-5 sm:py-6">
      <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Card Container */}
        <div className="bg-white rounded-2xl p-3 sm:p-5 lg:p-6 shadow-sm border border-gray-100 relative overflow-hidden transition-shadow duration-300 hover:shadow-md">
          {/* Decorative Background Gradient (Subtle) */}
          <div className="absolute top-0 right-0 w-56 h-56 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 mb-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2 text-indigo-600 font-bold tracking-widest uppercase text-xs">
                <FaGem /> Premium Picks
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                Featured Collection
              </h2>
            </div>

            <button
              onClick={() => navigate("/shop")}
              className="px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-medium shadow-lg hover:bg-gray-800 hover:scale-[1.03] transition-all duration-300 flex items-center gap-2"
            >
              Explore All <FaArrowRight size={12} />
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 relative z-10">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
