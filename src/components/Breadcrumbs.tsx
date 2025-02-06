import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const getBreadcrumbLabel = (path: string) => {
  switch (path) {
    case "":
      return "Home";
    case "generation-results":
      return "Generation Results";
    case "publish":
      return "Publish";
    default:
      return path;
  }
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  return (
    <div className="border-b border-polaris-border bg-white">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="text-polaris-text hover:text-polaris-teal">
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathSegments.map((segment, index) => {
              const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
              const isLast = index === pathSegments.length - 1;

              return (
                <BreadcrumbItem key={path}>
                  <BreadcrumbSeparator />
                  {isLast ? (
                    <BreadcrumbPage className="text-polaris-text">
                      {getBreadcrumbLabel(segment)}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        to={path}
                        className="text-polaris-text hover:text-polaris-teal"
                      >
                        {getBreadcrumbLabel(segment)}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};

export default Breadcrumbs;