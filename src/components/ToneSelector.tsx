
import * as React from "react"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type ToneStyle = 'formal' | 'elegant' | 'informal' | 'playful' | 'edgy';

interface ToneSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const toneDescriptions: Record<ToneStyle, string> = {
  formal: "Polished, professional, and authoritative. Suitable for luxury brands.",
  elegant: "Graceful, refined, and slightly poetic. Ideal for high-end fashion brands.",
  informal: "Friendly, casual, and conversational. Best for everyday wear brands.",
  playful: "Fun, energetic, and a bit cheeky. Great for youthful, trend-driven brands.",
  edgy: "Bold, daring, and provocative. Perfect for fashion-forward, avant-garde labels."
};

const toneStyles: ToneStyle[] = ['formal', 'elegant', 'informal', 'playful', 'edgy'];

export const ToneSelector = ({ value, onChange }: ToneSelectorProps) => {
  const currentTone = toneStyles[value];

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-polaris-text">Writing Tone</h4>
          <p className="text-sm text-polaris-secondary">
            Current: <span className="font-medium capitalize">{currentTone}</span>
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <p className="text-sm text-polaris-secondary hover:text-polaris-text">
                {toneDescriptions[currentTone]}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{toneDescriptions[currentTone]}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="pt-2">
        <Slider
          value={[value]}
          onValueChange={(vals) => onChange(vals[0])}
          max={4}
          step={1}
          className={cn(
            "w-full",
            "[&_[role=slider]]:h-4",
            "[&_[role=slider]]:w-4",
            "[&_[role=slider]]:transition-colors"
          )}
        />
        <div className="flex justify-between mt-2">
          {toneStyles.map((tone, index) => (
            <span
              key={tone}
              className={cn(
                "text-xs capitalize cursor-pointer transition-colors",
                index === value ? "text-polaris-text font-medium" : "text-polaris-secondary"
              )}
              onClick={() => onChange(index)}
            >
              {tone}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
