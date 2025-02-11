
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paintbrush } from "lucide-react";

interface StudioColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const StudioColorPicker = ({ color, onChange }: StudioColorPickerProps) => {
  const [tempColor, setTempColor] = useState(color);

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setTempColor(newColor);
    if (/^#[0-9A-F]{6}$/i.test(newColor)) {
      onChange(newColor);
    }
  };

  const presetColors = [
    { name: "Studio White", hex: "#FFFFFF" },
    { name: "Light Gray", hex: "#F1F1F1" },
    { name: "Medium Gray", hex: "#8A898C" },
    { name: "Dark Gray", hex: "#222222" },
    { name: "Studio Black", hex: "#000000" },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-[80px] h-[36px] p-1 relative"
          style={{ backgroundColor: color }}
        >
          <Paintbrush className="h-4 w-4 absolute text-[#1A1F2C] opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Background Color</label>
              <div 
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: tempColor }}
              />
            </div>
            <Input
              value={tempColor}
              onChange={handleHexInputChange}
              placeholder="#FFFFFF"
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Preset Colors</label>
            <div className="grid grid-cols-5 gap-2">
              {presetColors.map((preset) => (
                <button
                  key={preset.hex}
                  className="w-8 h-8 rounded border hover:scale-110 transition-transform"
                  style={{ backgroundColor: preset.hex }}
                  onClick={() => {
                    setTempColor(preset.hex);
                    onChange(preset.hex);
                  }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
