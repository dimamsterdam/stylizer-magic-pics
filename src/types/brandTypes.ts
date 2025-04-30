
import { Json } from "@/integrations/supabase/types";

export interface ModelDescription {
  id: string;
  description: string;
  imageUrl: string | null;
  approved: boolean;
  [key: string]: string | boolean | null; // Add index signature for Json compatibility
}

export interface BrandIdentity {
  id: string;
  brand_name?: string;
  values: string[];
  age_range_min: number;
  age_range_max: number;
  gender: 'all' | 'male' | 'female' | 'non_binary';
  income_level: 'low' | 'medium' | 'high' | 'luxury';
  characteristics: string[];
  photography_mood?: string;
  photography_lighting?: string;
  brand_models?: ModelDescription[];
}
