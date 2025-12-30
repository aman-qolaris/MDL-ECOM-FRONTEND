import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const AppShell = () => {
  return (
    // REMOVED 'bg-gray-50' so the body gradient shows through
    <div className="flex flex-col min-h-screen text-gray-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Header />

      {/* Main content container */}
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8 animate-fadeIn relative z-10">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default AppShell;
