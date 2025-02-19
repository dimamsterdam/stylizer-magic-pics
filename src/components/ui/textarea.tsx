
import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, placeholder, ...props }, ref) => {
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
      if (props.value) {
        setShowPlaceholder(false);
      } else {
        setShowPlaceholder(true);
      }
    }, [props.value]);

    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex min-h-[60px] w-full rounded-[12px] border border-input bg-background px-3 py-3 text-[16px] ring-offset-background placeholder:text-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
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
          {...props}
          onInput={adjustHeight}
        />
        {showPlaceholder && placeholder && (
          <div 
            className={cn(
              "absolute left-3 top-3 text-[16px] text-muted-foreground pointer-events-none",
              "before:content-['|'] before:mr-0.5 before:animate-cursor-blink before:text-current before:-ml-0.5",
              "whitespace-nowrap overflow-hidden",
              isAnimating ? "w-0 animate-typing" : "w-full"
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
