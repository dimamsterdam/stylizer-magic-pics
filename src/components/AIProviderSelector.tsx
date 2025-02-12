
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAIProvider } from "@/hooks/use-feature-flags";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export function AIProviderSelector() {
  const { data: currentProvider, isLoading } = useAIProvider();
  const [selectedProvider, setSelectedProvider] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProvider = async () => {
    if (!selectedProvider) return;

    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ value: selectedProvider })
        .eq('name', 'ai_provider');

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['aiProvider'] });
      
      toast({
        title: "Provider updated",
        description: `AI provider has been updated to ${selectedProvider}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update AI provider",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Provider Selection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Current Provider: {currentProvider}</label>
          <Select
            value={selectedProvider}
            onValueChange={setSelectedProvider}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="deepseek">Deepseek</SelectItem>
              <SelectItem value="perplexity">Perplexity</SelectItem>
              <SelectItem value="fal">Fal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={updateProvider}
          disabled={!selectedProvider || selectedProvider === currentProvider}
        >
          Update Provider
        </Button>
      </CardContent>
    </Card>
  );
}
