
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BrandNameForm } from "./BrandNameForm";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const OnboardingModal = ({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { toast } = useToast();
  const [step, setStep] = React.useState(1);
  
  const handleBrandNameSubmit = async (brandName: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('brand_identity')
        .insert([
          {
            brand_name: brandName,
            user_id: session.user.id,
            onboarding_completed: false,
            tasks_completed: []
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Brand identity created",
        description: "We've generated a brand identity for you to review.",
      });

      setStep(2);
    } catch (error) {
      console.error('Error creating brand:', error);
      toast({
        title: "Error",
        description: "There was an error creating your brand. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Welcome to Brandmachine" : "Next Steps"}
          </DialogTitle>
        </DialogHeader>
        {step === 1 ? (
          <BrandNameForm onSubmit={handleBrandNameSubmit} />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We've created two important items for you to review:
            </p>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium">1. Review Brand Identity</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We've generated a brand identity based on your input.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium">2. Check Brand Calendar</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  View your brand's retail calendar.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 mt-4 text-sm font-medium text-white bg-[#008060] rounded-md hover:bg-[#006e52]"
            >
              Get Started
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
