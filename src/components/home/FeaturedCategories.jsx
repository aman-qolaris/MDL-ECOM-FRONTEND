import { useNavigate } from "react-router-dom";
import { FaLaptop, FaMobileAlt, FaHeadphones, FaTshirt } from "react-icons/fa";

const categories = [
  { id: 1, name: "Electronics", icon: <FaLaptop size={30} /> },
  { id: 2, name: "Mobiles", icon: <FaMobileAlt size={30} /> },
  { id: 3, name: "Fashion", icon: <FaTshirt size={30} /> },
  { id: 4, name: "Accessories", icon: <FaHeadphones size={30} /> },
];

const FeaturedCategories = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName) => {
    navigate(`/shop?category=${categoryName}`);
  };

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Shop by Category
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCategoryClick(cat.name)}
            className="w-full flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="text-blue-500 mb-3">{cat.icon}</div>
            <span className="font-medium text-gray-700">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FeaturedCategories;
