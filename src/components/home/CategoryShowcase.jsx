import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

const categories = [
  {
    id: 1,
    name: "Electronics",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    color: "bg-blue-100",
  },
  {
    id: 2,
    name: "Fashion",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80",
    color: "bg-pink-100",
  },
  {
    id: 3,
    name: "Home & Living",
    image:
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=600&q=80",
    color: "bg-green-100",
  },
  {
    id: 4,
    name: "Sports",
    image:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=80",
    color: "bg-orange-100",
  },
];

const CategoryShowcase = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-2 block">
              Collections
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Shop by Category
            </h2>
            <p className="text-gray-500 mt-2 text-lg">
              Explore our widest range of collections
            </p>
          </div>

          <button
            onClick={() => navigate("/shop")}
            className="flex items-center gap-2 px-6 py-2 rounded-full border border-gray-200 text-gray-600 font-semibold hover:bg-gray-900 hover:text-white hover:border-transparent transition-all duration-300"
          >
            View All Categories <FaArrowRight className="text-sm" />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/shop?category=${cat.name}`)}
              className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100"
            >
              {/* Image with Zoom Effect */}
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
              />

              {/* Modern Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 opacity-90 group-hover:opacity-100 transition-opacity">
                <h3 className="text-white text-2xl font-bold translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  {cat.name}
                </h3>
                <div className="h-0 group-hover:h-6 overflow-hidden transition-all duration-500">
                  <span className="text-indigo-200 text-sm font-medium flex items-center gap-2 mt-2">
                    Explore Collection <FaArrowRight className="text-xs" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
