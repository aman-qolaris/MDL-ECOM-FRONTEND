import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const AppShell = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="flex flex-col min-h-screen text-gray-800 font-sans selection:bg-purple-100 selection:text-purple-900">
      <Header />

      {/* LOGIC: 
        - If it's the Home Page ("/"), we use 'w-full' to allow full-width banners (Hero, Deals).
        - If it's any other page (Shop, Cart, etc.), we use 'container' to keep content centered and readable.
      */}
      <main
        className={`flex-grow animate-fadeIn relative z-10 ${
          isHomePage
            ? "w-full" // Home Page: Full Width (Let sections handle their own containers)
            : "container mx-auto px-3 py-4 sm:px-6 sm:py-8 lg:px-8" // Others: Boxed Layout
        }`}
      >
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default AppShell;
