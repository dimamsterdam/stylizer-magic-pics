
import { Input } from "@/components/ui/input";
import { useEffect, useRef } from "react";

interface PromptInputProps {
  currentPrompt: string;
  position: { left: number; top: number };
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const PromptInput = ({ 
  currentPrompt, 
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

  return (
    <div 
      className="absolute"
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
          className="min-w-[200px]"
        />
      </div>
    </div>
  );
};

