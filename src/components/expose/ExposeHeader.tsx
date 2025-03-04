import React from 'react';
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/Breadcrumbs";
import StepProgress from "@/components/StepProgress";
interface ExposeHeaderProps {
  currentStep: 'products' | 'theme-content';
  onStepClick?: (step: 'products' | 'theme-content') => void;
}
export const ExposeHeader = ({
  currentStep,
  onStepClick
}: ExposeHeaderProps) => {
  return <div className="border-b border-[--p-border-subdued] bg-[--p-surface]">
      <div className="px-5 py-4">
        <Breadcrumbs className="mb-4" items={[{
        label: 'Home',
        href: '/'
      }, {
        label: 'Create Expose',
        href: '/expose'
      }]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display-lg text-[--p-text]">Product Spotlight</h1>
            <p className="mt-1 text-body text-[--p-text-subdued]">
              Generate AI-driven hero images with your products
            </p>
          </div>
        </div>
      </div>
      <StepProgress currentStep={currentStep} onStepClick={onStepClick} />
    </div>;
};