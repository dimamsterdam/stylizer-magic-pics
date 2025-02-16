
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { THEMES } from "@/lib/themes";
import { groupThemesByCategory } from "@/utils/themeUtils";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

interface ThemeSelectorProps {
  value: string;
  onChange: (themeId: string, styleGuide: string) => void;
}

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  const groupedThemes = groupThemesByCategory(THEMES);
  const categories = Object.keys(groupedThemes);
  
  // Initialize open state for categories, with "Coming Soon" open by default
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    return categories.reduce((acc, category) => ({
      ...acc,
      [category]: category === "Coming Soon"
    }), {});
  });

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <Collapsible
          key={category}
          open={openCategories[category]}
          onOpenChange={() => toggleCategory(category)}
        >
          <div className="border border-[#E3E5E7] rounded-lg p-4">
            <CollapsibleTrigger className="flex items-center justify-between w-full group">
              <div className="flex items-center space-x-2">
                <ChevronRight 
                  className={`h-4 w-4 text-[#6D7175] transition-transform duration-200 ${
                    openCategories[category] ? 'rotate-90' : ''
                  }`}
                />
                <h3 className="text-sm font-medium text-[#1A1F2C]">
                  {category} ({groupedThemes[category].length})
                </h3>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="pt-4">
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
            </CollapsibleContent>
          </div>
        </Collapsible>
      ))}
    </div>
  );
}
