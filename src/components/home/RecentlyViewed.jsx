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

  if (recentProducts.length === 0) return null; // Don't show if empty

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaHistory className="text-blue-600" /> Recently Viewed
          </h2>
          <button
            onClick={clearHistory}
            className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <FaTrash /> Clear History
          </button>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {recentProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className="min-w-[160px] md:min-w-[200px] bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100 flex-shrink-0"
            >
              <div className="h-32 w-full bg-gray-200 rounded-t-xl overflow-hidden relative">
                {/* Fallback image if actual image is missing */}
                <img
                  src={product.image || "https://via.placeholder.com/150"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-gray-800 truncate text-sm">
                  {product.name}
                </h3>
                <p className="text-blue-600 font-bold text-sm">
                  ₹{product.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
