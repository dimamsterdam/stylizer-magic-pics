
import * as React from "react"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

export type ToneStyle = 'formal' | 'elegant' | 'informal' | 'playful' | 'edgy';

interface ToneSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const toneStyles: ToneStyle[] = ['formal', 'elegant', 'informal', 'playful', 'edgy'];

export const ToneSelector = ({ value, onChange }: ToneSelectorProps) => {
  return (
    <div className="space-y-4 w-full">
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
