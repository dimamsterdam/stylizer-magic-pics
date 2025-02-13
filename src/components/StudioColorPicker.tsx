
import { useState, useCallback, useRef, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface StudioColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

interface HSV {
  h: number;
  s: number;
  v: number;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

const hexToRgb = (hex: string): RGB | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
};

const rgbToHsv = (r: number, g: number, b: number): HSV => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  const s = max === 0 ? 0 : diff / max;
  const v = max;

  if (diff !== 0) {
    switch (max) {
      case r:
        h = 60 * ((g - b) / diff + (g < b ? 6 : 0));
        break;
      case g:
        h = 60 * ((b - r) / diff + 2);
        break;
      case b:
        h = 60 * ((r - g) / diff + 4);
        break;
    }
  }

  return { h, s, v };
};

const hsvToRgb = (h: number, s: number, v: number): RGB => {
  const f = (n: number, k = (n + h / 60) % 6) => {
    return v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  };
  
  return {
    r: Math.round(f(5) * 255),
    g: Math.round(f(3) * 255),
    b: Math.round(f(1) * 255)
  };
};

export const StudioColorPicker = ({ color, onChange }: StudioColorPickerProps) => {
  const [tempColor, setTempColor] = useState(color);
  const [open, setOpen] = useState(false);
  const [hsv, setHsv] = useState<HSV>(() => {
    const rgb = hexToRgb(color) || { r: 255, g: 255, b: 255 };
    return rgbToHsv(rgb.r, rgb.g, rgb.b);
  });
  
  const saturationRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setTempColor(newColor);
    if (/^#[0-9A-F]{6}$/i.test(newColor)) {
      onChange(newColor);
      const rgb = hexToRgb(newColor);
      if (rgb) {
        setHsv(rgbToHsv(rgb.r, rgb.g, rgb.b));
      }
    }
  };

  const handleSaturationMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const handle = (e: MouseEvent) => {
      if (!saturationRef.current) return;
      
      const rect = saturationRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      
      const newHsv = { ...hsv, s: x, v: 1 - y };
      setHsv(newHsv);
      
      const rgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      setTempColor(hex);
      onChange(hex);
    };

    handle(e.nativeEvent);

    const onMouseMove = (e: MouseEvent) => handle(e);
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [hsv, onChange]);

  const handleHueMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const handle = (e: MouseEvent) => {
      if (!hueRef.current) return;
      
      const rect = hueRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      
      const newHsv = { ...hsv, h: x * 360 };
      setHsv(newHsv);
      
      const rgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      setTempColor(hex);
      onChange(hex);
    };

    handle(e.nativeEvent);

    const onMouseMove = (e: MouseEvent) => handle(e);
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [hsv, onChange]);

  const handlePresetColorClick = (hex: string) => {
    setTempColor(hex);
    onChange(hex);
    const rgb = hexToRgb(hex);
    if (rgb) {
      setHsv(rgbToHsv(rgb.r, rgb.g, rgb.b));
    }
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

  const currentRgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
  const saturationStyle = {
    backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
  };

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
            <div className="relative">
              <Input
                value={tempColor}
                readOnly
                placeholder="#FFFFFF"
                className="font-mono cursor-pointer pr-10"
              />
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9b87f5] hover:text-[#8B5CF6]"
              >
                Edit
              </button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div 
                ref={saturationRef}
                className="relative w-full h-40 rounded-lg cursor-pointer"
                style={saturationStyle}
                onMouseDown={handleSaturationMouseDown}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
                <div 
                  className="absolute w-4 h-4 -translate-x-2 -translate-y-2 border-2 border-white rounded-full"
                  style={{
                    left: `${hsv.s * 100}%`,
                    top: `${(1 - hsv.v) * 100}%`,
                    backgroundColor: tempColor,
                  }}
                />
              </div>

              <div 
                ref={hueRef}
                className="relative h-3 rounded-lg cursor-pointer"
                style={{
                  background: "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)"
                }}
                onMouseDown={handleHueMouseDown}
              >
                <div 
                  className="absolute w-4 h-4 -translate-x-2 -translate-y-[6px] border-2 border-white rounded-full shadow-md"
                  style={{
                    left: `${(hsv.h / 360) * 100}%`,
                    backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
                  }}
                />
              </div>

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
