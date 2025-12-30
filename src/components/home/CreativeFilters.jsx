import { useNavigate } from "react-router-dom";
import { FaLaptop, FaTshirt, FaHome, FaRunning, FaGem } from "react-icons/fa";

const categories = [
  {
    name: "Electronics",
    icon: <FaLaptop />,
    color: "bg-blue-100 text-blue-600",
  },
  { name: "Fashion", icon: <FaTshirt />, color: "bg-pink-100 text-pink-600" },
  { name: "Home", icon: <FaHome />, color: "bg-green-100 text-green-600" },
  {
    name: "Sports",
    icon: <FaRunning />,
    color: "bg-orange-100 text-orange-600",
  },
  { name: "Luxury", icon: <FaGem />, color: "bg-purple-100 text-purple-600" },
];

const CreativeFilters = () => {
  const navigate = useNavigate();

  return (
    <div className="py-6 container mx-auto px-4">
      <h3 className="text-2xl font-bold text-gray-700 mb-4">
        Explore by Category
      </h3>
      <div className="flex flex-wrap gap-4 justify-center md:justify-start">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => navigate(`/shop?category=${cat.name}`)}
            className={`flex items-center gap-2 px-12 py-6 rounded-full font-medium transition transform hover:-translate-y-1 hover:shadow-lg ${cat.color}`}
          >
            {cat.icon}
            <span>{cat.name}</span>
          </button>
        ))}

        {/* "View All" Chip */}
        <button
          onClick={() => navigate("/shop")}
          className="px-6 py-3 rounded-full border-2 border-gray-300 text-gray-600 font-medium hover:border-black hover:text-black transition"
        >
          View All Products
        </button>
      </div>
    </div>
  );
};

export default CreativeFilters;
