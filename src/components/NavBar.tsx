
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";

const NavBar = () => {
  const location = useLocation();
  
  const getBreadcrumbs = () => {
    const path = location.pathname;
    
    // Don't show breadcrumbs on home page
    if (path === '/') return null;
    
    const pathSegments = path.split('/').filter(segment => segment);
    
    if (pathSegments.length === 0) return null;
    
    // Map paths to user-friendly names
    const pathMap: Record<string, string> = {
      'dashboard': 'Dashboard',
      'stylizer': 'Stylizer',
      'expose': 'Product Spotlight',
      'videographer': 'Product Shorts',
      'fashion-models': 'Fashion Models',
      'product-photo-shoot': 'Photo Shoot',
      'settings': 'Settings',
      'library': 'Library',
      'images': 'Images',
      'videos': 'Videos'
    };
    
    return (
      <Breadcrumb className="ml-4">
        <BreadcrumbItem>
          <BreadcrumbLink href="/">
            <span className="text-sm text-[--p-text-subdued] hover:text-[--p-text]">Home</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;
          const segmentPath = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const displayName = pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
            
          return isLast ? (
            <BreadcrumbItem key={segment}>
              <span className="text-sm font-medium text-[--p-text]">{displayName}</span>
            </BreadcrumbItem>
          ) : (
            <React.Fragment key={segment}>
              <BreadcrumbItem>
                <BreadcrumbLink href={segmentPath}>
                  <span className="text-sm text-[--p-text-subdued] hover:text-[--p-text]">{displayName}</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <ChevronRight className="h-4 w-4 text-[--p-text-subdued]" />
            </React.Fragment>
          );
        })}
      </Breadcrumb>
    );
  };

  return (
    <nav className="bg-white border-b border-polaris-border w-full fixed top-0 left-0 right-0 h-16 z-50">
      <div className="h-full px-4 sm:px-6 lg:px-8">
        <div className="h-full flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="flex items-center">
                <svg width="31" height="31" viewBox="0 0 297 267" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                  <g clipPath="url(#clip0_47_26)">
                    <path d="M154.17 160.993C197.503 146.913 226.959 118.042 219.962 96.5061C212.965 74.9707 172.164 68.9268 128.83 83.0067C85.4969 97.0866 56.0406 125.959 63.0379 147.494C70.0351 169.029 110.836 175.073 154.17 160.993Z" stroke="#25B384" strokeWidth="2.076"/>
                    <path d="M150.474 176.217C211.904 171.921 259.75 140.525 257.342 106.091C254.935 71.6574 203.184 47.2256 141.754 51.5212C80.3245 55.8168 32.4778 87.2131 34.8857 121.647C37.2935 156.081 89.0441 180.512 150.474 176.217Z" stroke="#60B325" strokeWidth="2"/>
                    <path d="M297 0H0V267H297V0Z" fill="white"/>
                    <path d="M149.042 176.637C209.494 268.224 142.282 187.749 210.082 160.65C235.72 150.404 257.408 130.138 257.408 106.143C257.408 65.6606 198.622 40.4549 127.403 52.0781C-0.283936 72.917 19.7494 188.988 124.613 138.341C229.477 87.694 156.886 59.6706 95.1178 101.712C33.3497 143.754 58.4493 197.529 157.929 158.239C253.316 120.565 219.766 84.8989 190.037 82.0286" stroke="black" strokeWidth="11" strokeLinecap="round"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_47_26">
                      <rect width="297" height="267" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
                <span className="font-inter text-[#1A1F2C] tracking-[-0.03em] text-xl font-semibold">
                  brandmachine
                </span>
              </span>
            </Link>
            {getBreadcrumbs()}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
