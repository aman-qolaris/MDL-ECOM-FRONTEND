import { FaShippingFast, FaShieldAlt, FaUndo, FaHeadset } from "react-icons/fa";

const features = [
  {
    id: "trust-shipping",
    icon: <FaShippingFast />,
    title: "Free Shipping",
    desc: "Orders over ₹500",
  },
  {
    id: "trust-secure",
    icon: <FaShieldAlt />,
    title: "Secure Payment",
    desc: "100% Protected",
  },
  {
    id: "trust-returns",
    icon: <FaUndo />,
    title: "Easy Returns",
    desc: "7-Day Policy",
  },
  {
    id: "trust-support",
    icon: <FaHeadset />,
    title: "24/7 Support",
    desc: "Always Here",
  },
];

const TrustValues = () => {
  return (
    <section className="py-5 sm:py-6 bg-white border-t border-gray-100">
      <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {features.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-xl text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustValues;
