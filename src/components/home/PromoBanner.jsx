import { useNavigate } from "react-router-dom";
import { FaClock, FaArrowRight } from "react-icons/fa";

const PromoBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Gradient Background */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl">
        {/* Decorative Circle Overlay */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 rounded-full bg-yellow-400 opacity-20 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 text-white">
          <div className="mb-6 md:mb-0 max-w-lg">
            <div className="flex items-center gap-2 bg-white/20 w-fit px-3 py-1 rounded-full text-sm font-semibold mb-4 backdrop-blur-sm">
              <FaClock /> Limited Time Offer
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
              Summer Sale is Live!
            </h2>
            <p className="text-blue-100 text-lg mb-6">
              Get up to{" "}
              <span className="text-yellow-300 font-bold">50% OFF</span> on all
              electronics and fashion items. Don't miss out!
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-yellow-400 hover:text-blue-900 transition shadow-lg flex items-center gap-2"
            >
              Shop Now <FaArrowRight />
            </button>
          </div>

          {/* Ad Image / Graphic */}
          <div className="hidden md:block">
            {/* You can put an actual image here later */}
            <div className="w-64 h-64 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/30">
              <span className="text-6xl font-black italic opacity-80">50%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
