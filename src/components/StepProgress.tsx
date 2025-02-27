
import React from 'react';
import { ShoppingCart, WandSparkles } from 'lucide-react';

type Step = 'products' | 'theme-content';

interface StepProgressProps {
  currentStep: Step;
  onStepClick?: (step: Step) => void;
}

const StepProgress = ({ currentStep, onStepClick }: StepProgressProps) => {
  const steps = [
    { id: 'products' as const, label: 'Products', icon: ShoppingCart },
    { id: 'theme-content' as const, label: 'Theme & Content', icon: WandSparkles },
  ];

  const getStepStatus = (stepId: Step) => {
    if (stepId === currentStep) return 'active';
    
    const stepOrder = steps.findIndex(s => s.id === stepId);
    const currentStepOrder = steps.findIndex(s => s.id === currentStep);
    
    if (stepOrder < currentStepOrder) return 'completed';
    return 'upcoming';
  };

  const handleStepClick = (stepId: Step) => {
    const status = getStepStatus(stepId);
    if (status === 'completed' && onStepClick) {
      onStepClick(stepId);
    }
  };

  return (
    <div className="w-full px-6 py-4 border-b border-[#E3E5E7]">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;
          const isClickable = status === 'completed';
          
          return (
            <React.Fragment key={step.id}>
              <div 
                className={`flex flex-col items-center ${isClickable ? 'cursor-pointer' : ''}`}
                onClick={() => handleStepClick(step.id)}
              >
                <div 
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 mb-2
                    ${status === 'active' ? 'border-[#2C6ECB] bg-[#2C6ECB] text-white' : ''}
                    ${status === 'completed' ? 'border-[#8E9196] text-[#8E9196] hover:bg-[#F6F6F7]' : ''}
                    ${status === 'upcoming' ? 'border-[#8E9196] text-[#8E9196]' : ''}
                    ${isClickable ? 'transition-colors' : ''}
                  `}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span 
                  className={`
                    text-sm font-medium
                    ${status === 'active' ? 'text-[#2C6ECB]' : ''}
                    ${status === 'completed' ? 'text-[#8E9196]' : ''}
                    ${status === 'upcoming' ? 'text-[#8E9196]' : ''}
                  `}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={`
                    flex-1 h-[1px] mx-4 mt-[-20px]
                    ${getStepStatus(steps[index + 1].id) === 'upcoming' ? 'bg-[#E3E5E7]' : 'bg-[#D7DBE0]'}
                  `}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgress;
