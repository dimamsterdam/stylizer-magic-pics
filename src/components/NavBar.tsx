
import React from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <nav className="bg-white border-b border-polaris-border w-full fixed top-0 left-0 right-0 h-16 z-50">
      <div className="h-full px-4 sm:px-6 lg:px-8">
        <div className="h-full flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="flex items-center">
                <span className="font-inter text-[#1A1F2C] tracking-[-0.03em] text-xl font-semibold">
                  brandmachine
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
