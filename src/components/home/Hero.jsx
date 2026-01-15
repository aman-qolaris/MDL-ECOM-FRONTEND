import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import SmartImage from "../common/SmartImage";

const Hero = () => {
  return (
    <div className="relative w-full py-6 md:py-8 px-4 overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
      {/* Abstract Background Blobs for Depth */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-[2rem] p-6 md:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-white">
          {/* TEXT SECTION */}
          <div className="md:w-1/2 text-center md:text-left space-y-5">
            <span className="inline-block py-1.5 px-4 rounded-full bg-white/20 border border-white/30 text-indigo-100 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
              🚀 New Collection 2026
            </span>

            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight drop-shadow-lg">
              Redefine Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
                Digital Lifestyle
              </span>
            </h1>

            <p className="text-base md:text-lg text-indigo-100 max-w-lg mx-auto md:mx-0 leading-relaxed font-light">
              Experience the future of shopping with our curated collection of
              premium tech and fashion.
            </p>

            <div className="pt-3">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2 bg-white text-indigo-950 font-bold py-3 px-6 rounded-full shadow-xl shadow-indigo-900/20 hover:scale-105 hover:bg-indigo-50 transition-all duration-300"
              >
                Start Shopping{" "}
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* IMAGE SECTION */}
          <div className="md:w-1/2 flex justify-center perspective-[1000px] relative">
            <div className="relative transform md:rotate-3 hover:rotate-0 transition-all duration-700 ease-out z-10">
              <SmartImage
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
                alt="Hero Product"
                className="w-full max-w-xs sm:max-w-sm rounded-3xl shadow-2xl border-4 border-white/10"
                loading="lazy"
                decoding="async"
              />

              {/* Floating Badge */}
              <div className="absolute -bottom-4 -left-4 bg-white/90 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-white/50 flex items-center gap-3 animate-bounce-slow">
                <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-lg">
                  ⚡
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">
                    Trending
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    Smart Series
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
