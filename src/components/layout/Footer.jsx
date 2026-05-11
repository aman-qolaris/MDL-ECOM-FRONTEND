import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { memo } from "react";
import PropTypes from "prop-types";

const quickLinks = [
  { name: "About Us", path: "/about" },
  { name: "Contact Support", path: "/contact" },
  { name: "Privacy Policy", path: "/privacy" },
];

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white py-12 mt-auto border-t border-gray-800 relative overflow-hidden">
      {/* Decorative background glow (optional subtle effect) */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left relative z-10">
        {/* Column 1: Brand Info */}
        <div className="space-y-4">
          <h3 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            My E-Store
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
            Your one-stop destination for the best products at unbeatable
            prices. Shop with confidence and style.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="text-lg font-semibold mb-6 text-gray-100 relative inline-block">
            {"Quick Links"}
            <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-blue-500 rounded-full"></span>
          </h4>
          <ul className="space-y-3 text-gray-400 text-sm">
            {quickLinks.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className="hover:text-blue-400 transition-colors duration-300 flex items-center justify-center md:justify-start gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="transform group-hover:translate-x-1 transition-transform">
                    {item.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Socials */}
        <div>
          <h4 className="text-lg font-semibold mb-6 text-gray-100 relative inline-block">
            {"Stay Connected"}
            <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-purple-500 rounded-full"></span>
          </h4>

          <div className="flex justify-center md:justify-start space-x-4">
            <SocialIcon
              icon={<FaFacebookF />}
              color="hover:bg-blue-600"
              href="https://facebook.com"
              ariaLabel="Visit our Facebook page"
            />
            <SocialIcon
              icon={<FaTwitter />}
              color="hover:bg-sky-400"
              href="https://twitter.com"
              ariaLabel="Visit our Twitter page"
            />
            <SocialIcon
              icon={<FaInstagram />}
              color="hover:bg-pink-600"
              href="https://instagram.com"
              ariaLabel="Visit our Instagram page"
            />
            <SocialIcon
              icon={<FaLinkedinIn />}
              color="hover:bg-blue-700"
              href="https://linkedin.com"
              ariaLabel="Visit our LinkedIn page"
            />
          </div>
        </div>
      </div>

      {/* Copyright Strip */}
      <div className="border-t border-gray-800/50 mt-12 pt-8 text-center text-gray-500 text-xs font-medium relative z-10">
        <p>© {new Date().getFullYear()} My E-Store. All rights reserved.</p>
      </div>
    </footer>
  );
};

// Helper Component for Social Icons
const SocialIcon = memo(({ icon, color, href, ariaLabel }) => (
  <a
    href={href}
    aria-label={ariaLabel}
    target="_blank"
    rel="noopener noreferrer"
    className={`w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 transition-all duration-300 ${color} hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/20`}
  >
    {icon}
  </a>
));

SocialIcon.displayName = "SocialIcon";

SocialIcon.propTypes = {
  icon: PropTypes.node.isRequired,
  color: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  ariaLabel: PropTypes.string.isRequired,
};

export default memo(Footer);
