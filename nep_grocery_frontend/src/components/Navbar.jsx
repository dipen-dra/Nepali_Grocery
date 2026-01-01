import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";


const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };


  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-2">

          <Link to="/" className="flex items-center">
            <img src="/NepGrocery.png" alt="Grocery Logo" className="h-14 w-auto" />
          </Link>


          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("hero-section")}
              className="text-gray-600 hover:text-green-500 cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("featured-products")}
              className="text-gray-600 hover:text-green-500 cursor-pointer"
            >
              Products
            </button>
            <button
              onClick={() => scrollToSection("why-choose-us")}
              className="text-gray-600 hover:text-green-500 cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("footer")}
              className="text-gray-600 hover:text-green-500 cursor-pointer"
            >
              Contact
            </button>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to={user.role === 'admin' ? "/admin/dashboard" : "/dashboard"} className="text-gray-800 font-semibold hover:text-green-500">
                  Welcome, {user.fullName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;