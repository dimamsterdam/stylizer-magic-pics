
import React from 'react';
import { ShoppingCart, WandSparkles, Text, CheckCircle } from 'lucide-react';

type Step = 'products' | 'theme' | 'content' | 'review' | 'generation';

interface StepProgressProps {
  currentStep: Step;
}

const StepProgress = ({ currentStep }: StepProgressProps) => {
  const steps = [
    { id: 'products', label: 'Products', icon: ShoppingCart },
    { id: 'theme', label: 'Theme', icon: WandSparkles },
    { id: 'content', label: 'Content', icon: Text },
    { id: 'review', label: 'Review', icon: CheckCircle },
  ] as const;

  const getStepStatus = (stepId: typeof steps[number]['id']) => {
    const stepOrder = steps.findIndex(s => s.id === stepId);
    const currentStepOrder = steps.findIndex(s => s.id === currentStep);
    
    if (stepOrder === currentStepOrder) return 'active';
    if (stepOrder < currentStepOrder) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="w-full px-6 py-4 border-b border-[#E3E5E7]">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div 
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 mb-2
                    ${status === 'active' ? 'border-[#008060] bg-[#008060] text-white' : ''}
                    ${status === 'completed' ? 'border-[#008060] text-[#008060]' : ''}
                    ${status === 'upcoming' ? 'border-[#6D7175] text-[#6D7175]' : ''}
                  `}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span 
                  className={`
                    text-sm font-medium
                    ${status === 'active' ? 'text-[#008060]' : ''}
                    ${status === 'completed' ? 'text-[#008060]' : ''}
                    ${status === 'upcoming' ? 'text-[#6D7175]' : ''}
                  `}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={`
                    flex-1 h-[2px] mx-4 mt-[-20px]
                    ${getStepStatus(steps[index + 1].id) === 'upcoming' ? 'bg-[#E3E5E7]' : 'bg-[#008060]'}
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
