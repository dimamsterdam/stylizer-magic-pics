
import { useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ProtectedRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("Protected route session check:", { session, error });
      
      if (!session) {
        // Save the attempted route to redirect back after login
        navigate("/auth", { 
          state: { returnUrl: location.pathname }, 
          replace: true 
        });
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth", { 
          state: { returnUrl: location.pathname },
          replace: true 
        });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, location]);

  return <Outlet />;
};

export default ProtectedRoute;
