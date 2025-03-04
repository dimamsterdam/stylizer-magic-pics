
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label="breadcrumb"
        className={cn("flex", className)}
        {...props}
      >
        <ol className="flex items-center text-sm">
          {children}
        </ol>
      </nav>
    );
  }
);
Breadcrumb.displayName = "Breadcrumb";

interface BreadcrumbItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
}

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn("inline-flex items-center", className)}
        {...props}
      >
        {children}
      </li>
    );
  }
);
BreadcrumbItem.displayName = "BreadcrumbItem";

interface BreadcrumbLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean;
  href: string;
  isCurrentPage?: boolean;
  children: React.ReactNode;
}

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, href, isCurrentPage, children, ...props }, ref) => {
    return (
      <div className="flex items-center">
        <a
          ref={ref}
          href={href}
          aria-current={isCurrentPage ? "page" : undefined}
          className={cn(
            "text-sm",
            isCurrentPage 
              ? "text-polaris-text font-medium" 
              : "text-polaris-text-subdued hover:text-polaris-text",
            className
          )}
          {...props}
        >
          {children}
        </a>
        {!isCurrentPage && (
          <ChevronRight className="h-4 w-4 mx-2 text-polaris-text-subdued" />
        )}
      </div>
    );
  }
);
BreadcrumbLink.displayName = "BreadcrumbLink";

export { Breadcrumb, BreadcrumbItem, BreadcrumbLink };
