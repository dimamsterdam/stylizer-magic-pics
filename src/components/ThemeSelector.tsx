
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { THEMES } from "@/lib/themes";
import { groupThemesByCategory } from "@/utils/themeUtils";

interface ThemeSelectorProps {
  value: string;
  onChange: (themeId: string, styleGuide: string) => void;
}

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  const groupedThemes = groupThemesByCategory(THEMES);
  const categories = Object.keys(groupedThemes);

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category}>
          <h3 className="text-sm font-medium text-[#1A1F2C] mb-3">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedThemes[category].map((theme) => {
              const Icon = theme.icon;
              const isSelected = value === theme.id;

              return (
                <Card
                  key={theme.id}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? "border-[#9b87f5] bg-[#F1F0FB]"
                      : "border-[#E3E5E7] hover:border-[#9b87f5]"
                  }`}
                  onClick={() => onChange(theme.id, theme.styleGuide)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${theme.color}20` }}
                      >
                        <Icon
                          className="h-5 w-5"
                          style={{ color: theme.color }}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-[#1A1F2C]">
                          {theme.label}
                        </h4>
                        <p className="text-sm text-[#6D7175]">
                          {theme.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
