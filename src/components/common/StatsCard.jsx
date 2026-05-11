import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

const StatsCard = ({ title, value, icon, color, link, desc }) => {
  return (
    <Link
      to={link}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-blue-200 transition-all duration-300 group"
    >
      <div className="flex items-center gap-4 mb-3">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-md ${color}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
            {value}
          </h3>
        </div>
      </div>

      {desc && (
        <div className="border-t border-gray-100 pt-3 mt-1">
          <p className="text-xs text-gray-400 flex justify-between items-center group-hover:text-gray-600 transition-colors">
            {desc}
            <FaArrowRight className="transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 text-blue-500" />
          </p>
        </div>
      )}
    </Link>
  );
};

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired, // Allows React elements/icons to be passed in
  color: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  desc: PropTypes.string, // Left optional since it is conditionally rendered
};

export default StatsCard;
