
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

interface PromptInputProps {
  currentPrompt: string;
  suggestedPrompts?: string[];
  position: { left: number; top: number };
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const PromptInput = ({ 
  currentPrompt, 
  suggestedPrompts,
  position, 
  onChange, 
  onSubmit,
  onCancel 
}: PromptInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSuggestedPromptClick = (prompt: string) => {
    onChange(prompt);
    // Use requestAnimationFrame to ensure state is updated
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        onSubmit();
      });
    });
  };

  return (
    <div 
      className="absolute z-50"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        transform: 'translateX(-50%)'
      }}
    >
      <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200">
        <Input
          ref={inputRef}
          value={currentPrompt}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSubmit();
            } else if (e.key === 'Escape') {
              onCancel();
            }
          }}
          placeholder="Describe the change..."
          className="min-w-[200px] mb-2"
        />
        {suggestedPrompts && suggestedPrompts.length > 0 && (
          <div className="flex flex-col gap-1 mt-2">
            <p className="text-xs text-gray-500 font-medium">Suggested prompts:</p>
            <div className="flex flex-wrap gap-1">
              {suggestedPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleSuggestedPromptClick(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
