
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type FeatureFlag = {
  id: string;
  name: string;
  value: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export const useFeatureFlags = () => {
  return useQuery({
    queryKey: ['featureFlags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*');
      
      if (error) throw error;
      return data as FeatureFlag[];
    }
  });
};

export const useAIProvider = () => {
  return useQuery({
    queryKey: ['aiProvider'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('value')
        .eq('name', 'ai_provider')
        .single();
      
      if (error) throw error;
      return data.value as 'deepseek' | 'perplexity' | 'fal';
    }
  });
};
