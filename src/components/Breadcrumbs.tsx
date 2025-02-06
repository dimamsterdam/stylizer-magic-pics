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

const getFullPath = (currentPath: string) => {
  const paths = [
    { path: "", label: "Home" },
    { path: "generation-results", label: "Generation Results" },
    { path: "publish", label: "Publish" },
  ];

  const currentIndex = paths.findIndex((p) => currentPath.includes(p.path));
  return paths.slice(0, currentIndex + 1);
};

const Breadcrumbs = () => {
  const location = useLocation();
  const currentPath = location.pathname.split("/").filter(Boolean)[0] || "";
  const fullPath = getFullPath(currentPath);

  return (
    <div className="border-b border-polaris-border bg-white">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <Breadcrumb>
          <BreadcrumbList>
            {fullPath.map((segment, index) => {
              const path = segment.path === "" ? "/" : `/${segment.path}`;
              const isLast = index === fullPath.length - 1;

              return (
                <BreadcrumbItem key={path}>
                  {index > 0 && <BreadcrumbSeparator />}
                  {isLast ? (
                    <BreadcrumbPage className="text-polaris-text">
                      {segment.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        to={path}
                        className="text-polaris-text hover:text-polaris-teal"
                      >
                        {segment.label}
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