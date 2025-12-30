import { FaShippingFast, FaShieldAlt, FaUndo, FaHeadset } from "react-icons/fa";

const features = [
  {
    icon: <FaShippingFast size={28} />,
    title: "Free Shipping",
    desc: "On orders over ₹500",
  },
  {
    icon: <FaShieldAlt size={28} />,
    title: "Secure Payment",
    desc: "100% protected payments",
  },
  {
    icon: <FaUndo size={28} />,
    title: "Easy Returns",
    desc: "7-day return policy",
  },
  {
    icon: <FaHeadset size={28} />,
    title: "24/7 Support",
    desc: "Dedicated support team",
  },
];

const TrustValues = () => {
  return (
    // 1. CONTAINER: Removed solid white bg.
    // Now it floats transparently so the body gradient shows through the gaps.
    <div className="py-10 container mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {features.map((item, index) => (
          // 2. ITEM: Turned each feature into a 'Glass Card'
          <div
            key={index}
            className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/60 backdrop-blur-md border border-white/50 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:bg-white/80 group"
          >
            {/* Icon Circle: Gradient border and soft background */}
            <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 transition-transform duration-300 ring-1 ring-blue-100">
              {item.icon}
            </div>

            <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-blue-700 transition-colors">
              {item.title}
            </h3>

            <p className="text-sm text-gray-500 font-medium">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustValues;
