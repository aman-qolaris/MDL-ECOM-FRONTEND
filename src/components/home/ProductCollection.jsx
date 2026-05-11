import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import ProductCard from "../common/ProductCard";
import { FaArrowRight } from "react-icons/fa";

const ProductCollection = ({
  title,
  subtitle,
  products = [],
  link = "/shop",
}) => {
  const navigate = useNavigate();

  if (!products || products.length === 0) return null;

  return (
    <section className="py-3 sm:py-4">
      <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-3 sm:p-5 lg:p-6 shadow-sm border border-gray-100 transition-shadow duration-300 hover:shadow-md">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-3 gap-3 border-b border-gray-100 pb-2">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-gray-500 mt-1 text-xs sm:text-sm md:text-base font-medium">
                  {subtitle}
                </p>
              )}
            </div>

            <button
              onClick={() => navigate(link)}
              className="flex items-center gap-2 text-indigo-600 text-sm font-semibold hover:text-indigo-800 transition-colors group motion-safe:duration-300"
            >
              See All{" "}
              <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

ProductCollection.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }),
  ),
  link: PropTypes.string,
};

export default ProductCollection;
