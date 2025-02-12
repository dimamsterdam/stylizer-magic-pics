
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StudioColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const StudioColorPicker = ({ color, onChange }: StudioColorPickerProps) => {
  const [tempColor, setTempColor] = useState(color);
  const [open, setOpen] = useState(false);

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setTempColor(newColor);
    if (/^#[0-9A-F]{6}$/i.test(newColor)) {
      onChange(newColor);
      setOpen(false);
    }
  };

  const handlePresetColorClick = (hex: string) => {
    setTempColor(hex);
    onChange(hex);
    setOpen(false);
  };

  const presetColors = [
    { name: "Studio White", hex: "#FFFFFF" },
    { name: "Light Gray", hex: "#F1F1F1" },
    { name: "Medium Gray", hex: "#8A898C" },
    { name: "Dark Gray", hex: "#222222" },
    { name: "Studio Black", hex: "#000000" },
    { name: "Primary Purple", hex: "#9b87f5" },
    { name: "Vivid Purple", hex: "#8B5CF6" },
    { name: "Magenta Pink", hex: "#D946EF" },
    { name: "Bright Orange", hex: "#F97316" },
    { name: "Ocean Blue", hex: "#0EA5E9" },
    { name: "Sky Blue", hex: "#33C3F0" },
    { name: "Soft Green", hex: "#F2FCE2" },
    { name: "Soft Yellow", hex: "#FEF7CD" },
    { name: "Soft Orange", hex: "#FEC6A1" },
    { name: "Soft Purple", hex: "#E5DEFF" },
    { name: "Soft Pink", hex: "#FFDEE2" },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Background Color</label>
          <div 
            className="w-8 h-8 rounded-full border"
            style={{ backgroundColor: tempColor }}
          />
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Input
              value={tempColor}
              readOnly
              onClick={() => setOpen(true)}
              placeholder="#FFFFFF"
              className="font-mono cursor-pointer"
            />
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Hex Color</Label>
                <Input
                  value={tempColor}
                  onChange={handleHexInputChange}
                  placeholder="#FFFFFF"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Preset Colors</Label>
                <div className="grid grid-cols-8 gap-2">
                  {presetColors.map((preset) => (
                    <button
                      key={preset.hex}
                      className="w-6 h-6 rounded-full border hover:scale-110 transition-transform"
                      style={{ backgroundColor: preset.hex }}
                      onClick={() => handlePresetColorClick(preset.hex)}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
