
import React from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <nav className="bg-white border-b border-polaris-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="flex items-center">
                <span className="font-inter font-bold text-[#1A1F2C] tracking-[-0.03em] text-xl">
                  brandmachine
                </span>
                <span className="ml-2 font-inter font-semibold text-polaris-secondary text-lg">
                  Stylizer
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

