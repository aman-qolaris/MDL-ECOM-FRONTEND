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

  if (recentProducts.length === 0) return null;

  return (
    <section className="py-12 border-t border-gray-100 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <FaHistory />
            </span>
            Recently Viewed
          </h2>
          <button
            onClick={clearHistory}
            className="text-sm text-red-500 hover:bg-red-50 px-3 py-1 rounded-full transition-colors flex items-center gap-2"
          >
            <FaTrash /> Clear History
          </button>
        </div>

        {/* Improved Horizontal Scroll */}
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-indigo-500 scrollbar-track-transparent p-1">
          {recentProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className="min-w-[200px] bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 group"
            >
              <div className="h-40 w-full bg-gray-100 relative overflow-hidden">
                <img
                  src={
                    product.image ||
                    product.imageUrl ||
                    "https://via.placeholder.com/150"
                  }
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 truncate text-sm mb-1">
                  {product.name}
                </h3>
                <p className="text-indigo-600 font-bold text-sm">
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
