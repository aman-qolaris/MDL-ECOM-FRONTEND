import { useNavigate } from "react-router-dom";
import ProductCard from "../common/ProductCard";
import { FaArrowRight } from "react-icons/fa";

const ProductCollection = ({
  title,
  subtitle,
  products = [],
  link = "/shop",
}) => {
  const navigate = useNavigate();

  // If no products provided, show nothing or skeleton
  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header Section (Matches CategoryShowcase Style) */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-gray-500 mt-2 text-lg font-light">
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={() => navigate(link)}
            className="flex items-center gap-2 px-6 py-2 rounded-full border border-gray-200 text-gray-600 font-semibold hover:bg-gray-900 hover:text-white hover:border-transparent transition-all duration-300 group"
          >
            See All{" "}
            <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCollection;
