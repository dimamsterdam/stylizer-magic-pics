
import React from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href: string }>;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  icon,
  breadcrumbs,
  className
}: PageHeaderProps) {
  return (
    <div className={`space-y-4 p-6 ${className}`}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-2" />}
      
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-2">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <h1 className="text-headingXl font-medium text-polaris-text">{title}</h1>
        </div>
        {description && (
          <p className="text-bodyMd text-polaris-text-subdued">{description}</p>
        )}
      </div>
      
      {children && <div>{children}</div>}
    </div>
  );
}
