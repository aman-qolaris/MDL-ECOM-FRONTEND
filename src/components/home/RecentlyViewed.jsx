import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHistory, FaTrash } from "react-icons/fa";

const RecentlyViewed = () => {
  const [recentProducts, setRecentProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
      setRecentProducts(data);
    } catch (err) {
      console.error("Error loading recent history", err);
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("recentlyViewed");
    setRecentProducts([]);
  };

  return (
    <section className="py-5 sm:py-6">
      <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-3 sm:p-5 lg:p-6 shadow-sm border border-gray-100 transition-shadow duration-300 hover:shadow-md">
          <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                <FaHistory />
              </span>
              {/* 🟢 FIX: Wrapped raw text in a span to eliminate ambiguous spacing and let flex gap-2 handle it */}
              <span>Recently Viewed</span>
            </h2>

            {recentProducts.length > 0 && (
              <button
                type="button" // 🟢 Added type="button" for good measure
                onClick={clearHistory}
                className="text-xs sm:text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-2 font-medium focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <FaTrash />
                {/* 🟢 FIX: Wrapped raw text in a span here as well */}
                <span>Clear</span>
              </button>
            )}
          </div>

          {recentProducts.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm sm:text-base font-semibold text-gray-900">
                  No recently viewed items yet
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Open any product to start building your history.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/shop")}
                className="px-3 py-1.5 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2">
              {recentProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[150px] sm:min-w-[170px] bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 group"
                >
                  <div className="h-28 sm:h-32 w-full bg-gray-50 relative overflow-hidden">
                    <img
                      src={
                        product.image ||
                        product.imageUrl ||
                        "https://via.placeholder.com/300"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 truncate text-sm mb-1">
                      {product.name}
                    </h3>
                    <p className="text-indigo-600 font-extrabold text-sm">
                      ₹{product.price}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
