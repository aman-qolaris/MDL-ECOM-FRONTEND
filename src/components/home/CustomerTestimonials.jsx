import { FaQuoteLeft, FaStar } from "react-icons/fa";

const testimonials = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Verified Buyer",
    text: "The delivery was incredibly fast, and the quality of the headphones exceeded my expectations. Will definitely shop again!",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 2,
    name: "Sarah Williams",
    role: "Fashion Enthusiast",
    text: "I love the variety of fashion items available. The denim jacket I bought fits perfectly and looks exactly like the photos.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 3,
    name: "Michael Chen",
    role: "Tech Geek",
    text: "Great prices on electronics. Customer support helped me choose the right gaming mouse. Highly recommended!",
    rating: 4,
    avatar: "https://randomuser.me/api/portraits/men/86.jpg",
  },
];

const CustomerTestimonials = () => {
  return (
    <section className="py-5 sm:py-6 bg-gray-50 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div
        className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#4f46e5 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      ></div>

      <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-5">
          <span className="text-indigo-600 font-bold tracking-widest uppercase text-xs">
            Community Love
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2 mb-3">
            Trusted by 10,000+ Customers
          </h2>
          <p className="text-gray-500 text-base">
            Real stories from our community members about their shopping
            experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 relative group"
            >
              {/* Quote Icon */}
              <div className="absolute top-5 right-5 text-indigo-100 group-hover:text-indigo-500 transition-colors duration-300">
                <FaQuoteLeft className="text-3xl" />
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-1 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base leading-tight">
                    {t.name}
                  </h4>
                  <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wide">
                    {t.role}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex text-amber-400 text-xs mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <FaStar key={`star-${t.id}-${i}`} />
                ))}
              </div>

              {/* Text */}
              <p className="text-sm text-gray-600 leading-relaxed italic relative z-10">
                "{t.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerTestimonials;
