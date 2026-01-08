import { FaShippingFast, FaShieldAlt, FaUndo, FaHeadset } from "react-icons/fa";

const features = [
  {
    icon: <FaShippingFast />,
    title: "Free Shipping",
    desc: "Orders over ₹500",
  },
  { icon: <FaShieldAlt />, title: "Secure Payment", desc: "100% Protected" },
  { icon: <FaUndo />, title: "Easy Returns", desc: "7-Day Policy" },
  { icon: <FaHeadset />, title: "24/7 Support", desc: "Always Here" },
];

const TrustValues = () => {
  return (
    <section className="py-12 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-2xl text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-base">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustValues;
