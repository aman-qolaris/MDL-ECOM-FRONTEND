import { Link } from "react-router-dom";

const Hero = () => {
  return (
    // 1. CONTAINER: Changed from solid blue to "Glass Card"
    // 'bg-white/30' lets the new colorful body gradient show through
    <div className="relative bg-white/30 backdrop-blur-lg border border-white/50 rounded-3xl p-8 md:p-16 mb-12 flex flex-col md:flex-row items-center justify-between shadow-2xl overflow-hidden">
      {/* Decorative Blur behind the text (optional, adds depth) */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/40 to-transparent pointer-events-none z-0"></div>

      {/* TEXT SECTION */}
      <div className="relative z-10 md:w-1/2 mb-10 md:mb-0 text-center md:text-left">
        {/* Badge */}
        <span className="inline-block py-1 px-3 rounded-full bg-blue-100/80 text-blue-700 text-xs font-bold tracking-wide mb-6 backdrop-blur-sm border border-blue-200">
          NEW ARRIVALS 2025
        </span>

        {/* Headline: Gradient Text */}
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-gray-900">
          Summer Sale <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Up to 50% Off
          </span>
        </h1>

        {/* Description: Darker text for readability on glass */}
        <p className="text-lg md:text-xl mb-8 text-gray-700 max-w-lg mx-auto md:mx-0 leading-relaxed">
          Discover the latest trends in fashion and electronics. Limited time
          offer for our exclusive members.
        </p>

        {/* Button: Modern Dark Pill */}
        <Link
          to="/shop"
          className="bg-slate-900 text-white font-bold py-4 px-10 rounded-full shadow-xl hover:bg-slate-800 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 inline-flex items-center gap-2"
        >
          Shop Now
        </Link>
      </div>

      {/* IMAGE SECTION */}
      <div className="relative z-10 md:w-1/2 flex justify-center perspective-1000">
        {/* Image Backing Card (Frosted frame) */}
        <div className="relative p-3 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg transform md:rotate-3 hover:rotate-0 transition-all duration-700 ease-out">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            alt="Shopping Hero"
            className="w-full max-w-md rounded-xl shadow-inner"
          />

          {/* Floating 'Premium' Tag */}
          <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 animate-bounce-slow">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-xl">
              ✨
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">
                Best Seller
              </p>
              <p className="text-sm font-bold text-gray-800">
                Premium Collection
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
