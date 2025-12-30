import { Link } from "react-router-dom";
import { FaShoppingCart, FaUser, FaSearch, FaBars } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getCartItems } from "../../store/thunks/cartThunks";

const Header = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCartItems());
    }
  }, [dispatch, isAuthenticated]);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    // 1. UPDATED: More transparency (white/70) and stronger blur (blur-xl) to match new index.css
    // Added 'animate-fadeIn' so the header appears smoothly
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm transition-all duration-300 animate-fadeIn">
      <div className="container mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo with Gradient */}
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-80 transition-opacity"
          >
            My E-Store
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 mx-10 max-w-lg relative group">
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full bg-white/50 border border-white/60 text-gray-700 rounded-full py-2.5 px-5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm group-hover:bg-white/80"
            />
            <button className="absolute right-4 top-3 text-gray-400 group-hover:text-blue-600 transition-colors">
              <FaSearch />
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative text-gray-600 hover:text-blue-600 transition-transform duration-200 hover:scale-110"
            >
              <FaShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2.5 -right-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Logic Preserved */}
            {isAuthenticated ? (
              <Link to="/profile" className="flex items-center space-x-3 group">
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm group-hover:border-blue-300 transition-colors bg-gray-100 flex items-center justify-center">
                  {user?.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 font-bold text-sm">
                      {user?.name?.charAt(0).toUpperCase() || (
                        <FaUser size={14} />
                      )}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                  {user?.name?.split(" ")[0] || "Profile"}
                </span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <FaUser size={14} />
                <span>Login</span>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600 hover:text-blue-600 focus:outline-none transition-colors p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <FaBars size={24} />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-gray-100 shadow-2xl p-4 animate-slideUp z-40 rounded-b-2xl">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
              <FaSearch className="absolute right-4 top-4 text-gray-400" />
            </div>

            <div className="space-y-3">
              <Link
                to="/cart"
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                  <FaShoppingCart size={16} />
                </div>
                <span className="font-medium">Cart ({cartCount})</span>
              </Link>

              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                    {user?.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-purple-600 font-bold text-xs">
                        {user?.name?.charAt(0).toUpperCase() || (
                          <FaUser size={12} />
                        )}
                      </span>
                    )}
                  </div>
                  <span className="font-medium">My Profile ({user?.name})</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 text-gray-700 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="bg-gray-200 p-2 rounded-full text-gray-600">
                    <FaUser size={16} />
                  </div>
                  <span className="font-medium">Login / Register</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
