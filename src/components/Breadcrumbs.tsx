
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Define all possible routes and their labels
const ROUTE_LABELS: Record<string, string> = {
  "": "Home",
  "generation-results": "Generation Results",
  "publish": "Publish",
};

const Breadcrumbs = () => {
  const location = useLocation();
  
  // Get path segments, filtering out empty strings
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Don't show breadcrumbs on home page
  if (pathSegments.length === 0) return null;

  // Build breadcrumb items
  const breadcrumbItems = pathSegments.map((segment, index) => {
    // Get the path up to this segment
    const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const label = ROUTE_LABELS[segment] || segment;
    const isLast = index === pathSegments.length - 1;

    return {
      path,
      label,
      isLast,
    };
  });

  return (
    <div className="border-b border-polaris-border bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2">
        <Breadcrumb>
          <BreadcrumbList>
            {/* Always show Home as first item unless we're on home page */}
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  to="/"
                  className="text-[#6D7175] hover:text-[#9b87f5] transition-colors"
                >
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {breadcrumbItems.map(({ path, label, isLast }) => (
              <BreadcrumbItem key={path}>
                <BreadcrumbSeparator />
                {isLast ? (
                  <BreadcrumbPage className="text-[#1A1F2C] font-semibold">
                    {label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      to={path}
                      className="text-[#6D7175] hover:text-[#9b87f5] transition-colors"
                    >
                      {label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};

export default Breadcrumbs;
