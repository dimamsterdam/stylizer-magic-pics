
import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, placeholder, value, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const [showPlaceholder, setShowPlaceholder] = React.useState(true);
    const [isAnimating, setIsAnimating] = React.useState(true);

    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };

    React.useEffect(() => {
      adjustHeight();
    }, [props.value]);

    React.useEffect(() => {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 3000); // Duration of typing animation
      return () => clearTimeout(timer);
    }, [placeholder]);

    React.useEffect(() => {
      if (value) {
        setShowPlaceholder(false);
      } else {
        setShowPlaceholder(true);
      }
    }, [value]);

    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex min-h-[20px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={(element) => {
            if (typeof ref === 'function') {
              ref(element);
            } else if (ref) {
              ref.current = element;
            }
            textareaRef.current = element;
          }}
          placeholder={placeholder}
          value={value}
          {...props}
          onInput={adjustHeight}
        />
        {showPlaceholder && placeholder && (
          <div 
            className={cn(
              "absolute left-3 top-2 text-sm text-muted-foreground pointer-events-none",
              "before:content-['|'] before:mr-1 before:animate-cursor-blink before:text-current",
              "whitespace-nowrap overflow-hidden",
              isAnimating ? "w-0 animate-typing pl-[0.7rem]" : "w-full pl-[0.7rem]"
            )}
          >
            {placeholder}
          </div>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
