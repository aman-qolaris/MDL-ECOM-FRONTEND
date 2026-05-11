import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types"; // <-- Imported PropTypes

const StatsCard = ({ title, value, icon, color, link, desc }) => {
  return (
    <Link
      to={link}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group duration-300"
    >
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg shadow-sm ${color}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
            {value}
          </h3>
        </div>
      </div>
      <p className="text-xs text-gray-400 flex items-center justify-between group-hover:text-gray-600">
        {desc}{" "}
        <span className="transform group-hover:translate-x-1 transition-transform">
          →
        </span>
      </p>
    </Link>
  );
};

// Add explicit prop validations
StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired, // Expects a React element/icon
  color: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
};

export default StatsCard;
