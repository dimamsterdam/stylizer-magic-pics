import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const routes = [
  { path: "/", label: "Home" },
  { path: "/generation-results", label: "Generation Results" },
  { path: "/publish", label: "Publish" },
];

const getBreadcrumbs = (pathname: string) => {
  const paths = pathname.split("/").filter(Boolean);
  let currentPath = "";

  return [
    { path: "/", label: "Home" },
    ...paths.map((segment) => {
      currentPath += `/${segment}`;
      const route = routes.find((r) => r.path === currentPath);
      return {
        path: currentPath,
        label: route ? route.label : segment,
      };
    }),
  ];
};

const Breadcrumbs = () => {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  if (location.pathname === "/") {
    return null;
  }

  return (
    <div className="border-b border-polaris-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb className="py-4">
          {breadcrumbs.map((segment, index) => {
            const path = segment.path;
            const isLast = index === breadcrumbs.length - 1;

            return (
              <BreadcrumbItem key={path}>
                {index > 0 && <BreadcrumbSeparator />}
                {isLast ? (
                  <BreadcrumbPage className="text-polaris-text font-semibold">
                    {segment.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      to={path}
                      className="text-polaris-secondary hover:text-polaris-teal"
                    >
                      {segment.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            );
          })}
        </Breadcrumb>
      </div>
    </div>
  );
};

export default Breadcrumbs;