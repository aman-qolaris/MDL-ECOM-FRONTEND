import { useState, useEffect } from "react";
import { FaClock, FaBolt, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const DealsOfTheDay = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    hours: 10,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0)
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-8 sm:py-10 bg-gradient-to-r from-violet-900 via-indigo-900 to-purple-900 text-white overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] -translate-y-10 translate-x-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] translate-y-10 -translate-x-10 pointer-events-none"></div>
      <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left: Text Content */}
          <div className="text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-rose-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full mb-4 shadow-lg shadow-rose-500/20 animate-pulse">
              <FaBolt /> FLASH SALE LIVE
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight">
              24-Hour <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400">
                Super Deals
              </span>
            </h2>

            <p className="text-indigo-100 text-base md:text-lg mb-6 leading-relaxed opacity-90">
              Don't miss out! Exclusive discounts on premium electronics and
              fashion drops. Prices reset at midnight.
            </p>

            <button
              onClick={() => navigate("/shop")}
              className="group bg-white text-indigo-950 px-6 py-3 rounded-full font-bold text-base hover:bg-amber-300 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2 mx-auto lg:mx-0"
            >
              Shop All Deals{" "}
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Right: Timer Card */}
          <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group hover:border-white/30 transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50"></div>

            <h3 className="text-lg font-bold mb-6 flex items-center justify-center gap-3 text-indigo-50">
              <FaClock className="text-yellow-400 text-xl animate-spin-slow" />
              <span>Ending In</span>
            </h3>

            <div className="flex justify-between gap-2 sm:gap-4 text-center">
              {["hours", "minutes", "seconds"].map((unit) => (
                <div
                  key={unit}
                  className="flex-1 bg-black/20 rounded-xl p-3 border border-white/5 backdrop-blur-sm group-hover:bg-black/30 transition-colors"
                >
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-white mb-1">
                    {String(timeLeft[unit]).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-indigo-200">
                    {unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DealsOfTheDay;
