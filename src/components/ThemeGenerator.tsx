
import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  Loader2, 
  Sparkles,
  Sun, 
  Moon, 
  Building2, 
  Crown, 
  Minimize2, 
  Palette, 
  Home, 
  Moon as MoonIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  title: string;
  sku: string;
  image: string;
}

interface ThemePill {
  keyword: string;
  color: string;
  template: string;
  icon: React.ComponentType<any>;
}

interface ThemeGeneratorProps {
  onThemeSelect: (theme: string) => void;
  selectedProducts: Product[];
}

const THEME_SUGGESTIONS: ThemePill[] = [
  {
    keyword: "Studio",
    color: "#D6BCFA",
    template: "Professional studio setup with EFFECT lighting and MOOD atmosphere",
    icon: Sparkles
  },
  {
    keyword: "Natural",
    color: "#F2FCE2",
    template: "Natural daylight setting with MOOD tones and organic elements",
    icon: Sun
  },
  {
    keyword: "Dramatic",
    color: "#1A1F2C",
    template: "High-contrast studio setup with dramatic shadows and MOOD atmosphere",
    icon: Moon
  },
  {
    keyword: "Urban",
    color: "#D3E4FD",
    template: "Modern city environment with MOOD lighting and urban elements",
    icon: Building2
  },
  {
    keyword: "Luxury",
    color: "#FDE1D3",
    template: "Elegant MATERIAL surfaces with gold accents and soft lighting",
    icon: Crown
  },
  {
    keyword: "Minimal",
    color: "#E5DEFF",
    template: "Clean minimalist setting with MOOD tones and simple backdrop",
    icon: Minimize2
  },
  {
    keyword: "Vibrant",
    color: "#F97316",
    template: "Dynamic setting with vibrant colors and energetic composition",
    icon: Palette
  },
  {
    keyword: "Cozy",
    color: "#FEC6A1",
    template: "Warm and inviting environment with soft textures and gentle lighting",
    icon: Home
  },
  {
    keyword: "Evening",
    color: "#9b87f5",
    template: "Evening atmosphere with ambient lighting and sophisticated mood",
    icon: MoonIcon
  }
];

export function ThemeGenerator({ onThemeSelect, selectedProducts }: ThemeGeneratorProps) {
  const [generatingTheme, setGeneratingTheme] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleThemeClick = async (theme: ThemePill) => {
    setGeneratingTheme(theme.keyword);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-theme-description', {
        body: {
          keyword: theme.keyword,
          template: theme.template,
          products: selectedProducts.map(p => ({
            title: p.title,
            sku: p.sku
          }))
        }
      });

      if (error) throw error;

      onThemeSelect(data.themeDescription);
      toast({
        title: "Theme generated",
        description: "Your theme description has been updated.",
      });
    } catch (error) {
      console.error('Error generating theme:', error);
      toast({
        title: "Error",
        description: "Failed to generate theme description. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingTheme(null);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        Quick Theme Suggestions
      </h3>
      <div className="flex flex-wrap gap-2">
        {THEME_SUGGESTIONS.map((theme) => {
          const IconComponent = theme.icon;
          return (
            <Button
              key={theme.keyword}
              variant="outline"
              className={cn(
                "rounded-full transition-colors group",
                theme.keyword === "Dramatic" && "text-white",
                generatingTheme === theme.keyword ? "opacity-70" : "hover:opacity-80"
              )}
              style={{
                backgroundColor: theme.color,
                borderColor: theme.color
              }}
              onClick={() => handleThemeClick(theme)}
              disabled={!!generatingTheme}
            >
              {generatingTheme === theme.keyword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <IconComponent className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-360" />
                  {theme.keyword}
                </>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
