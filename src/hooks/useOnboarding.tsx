
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          navigate('/auth');
          return;
        }

        const { data } = await supabase
          .from('brand_identity')
          .select('onboarding_completed')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (!data) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [navigate]);

  const closeOnboarding = () => {
    setShowOnboarding(false);
  };

  return { showOnboarding, closeOnboarding, loading };
};
