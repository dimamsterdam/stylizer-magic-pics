
import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  children
}: PageHeaderProps) {
  return (
    <div className="flex flex-col space-y-2">
      {children && <div className="mb-2">{children}</div>}
      <h1 className="text-headingXl font-medium text-polaris-text">{title}</h1>
      {description && (
        <p className="text-bodyMd text-polaris-text-subdued">{description}</p>
      )}
    </div>
  );
}
