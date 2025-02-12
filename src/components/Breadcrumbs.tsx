
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ROUTE_LABELS: Record<string, string> = {
  "": "Home",
  "generation-results": "Generation Results",
  "publish": "Publish",
  "configure": "Configure Generation",
};

const Breadcrumbs = () => {
  const location = useLocation();
  
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  if (pathSegments.length === 0) return null;

  // Add "Configure Generation" as previous step before "Generation Results"
  if (pathSegments.includes('generation-results')) {
    pathSegments.splice(pathSegments.indexOf('generation-results'), 0, 'configure');
  }

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const label = ROUTE_LABELS[segment] || segment;
    const isLast = index === pathSegments.length - 1;

    // For "configure" segment, make it link back to home with state preserved
    if (segment === 'configure') {
      return {
        path: '/',
        label,
        isLast,
      };
    }

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
