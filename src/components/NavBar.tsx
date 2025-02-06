import React from "react";

const NavBar = () => {
  return (
    <nav className="bg-white border-b border-polaris-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-inter text-polaris-text tracking-[-0.03em] uppercase">
              brandmachine
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;