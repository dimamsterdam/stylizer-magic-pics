
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Extract returnUrl from location state if available
  const returnUrl = location.state?.returnUrl || "/";

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("Session check:", { session, error });
      if (session) {
        navigate(returnUrl, { replace: true });
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", { event, session });
      if (session) {
        navigate(returnUrl, { replace: true });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, returnUrl]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
          }
        });
        
        if (error) throw error;
        
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          throw new Error("Email already registered");
        }
        
        toast({
          title: "Verification email sent",
          description: "Please check your email to confirm your account.",
        });
        
        setEmail("");
        setPassword("");
        setIsSignUp(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        navigate(returnUrl, { replace: true });
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      
      let errorMessage = error.message;
      if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please check your email and confirm your account before signing in.";
      } else if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. If you haven't registered yet, please sign up first.";
      } else if (error.message.includes("Email rate limit exceeded")) {
        errorMessage = "Too many attempts. Please try again later.";
      } else if (error.message.includes("Email already registered")) {
        errorMessage = "This email is already registered. Please sign in instead.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f8f9fa] to-[#f1f3f5]">
      <div className="w-full max-w-[400px] px-4">
        <Card className="w-full border-0 shadow-none bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 p-6">
            <h1 className="text-2xl font-medium text-[#212529]">
              {isSignUp ? "Create account" : "Welcome back"}
            </h1>
            <p className="text-sm text-[#6c757d]">
              {isSignUp
                ? "Sign up to get started"
                : "Sign in to continue"}
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-1">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="h-11 bg-white border-[#dee2e6] focus:border-[#008060] focus:ring-1 focus:ring-[#008060]"
                  required
                />
              </div>
              <div className="space-y-1">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="h-11 bg-white border-[#dee2e6] focus:border-[#008060] focus:ring-1 focus:ring-[#008060]"
                  minLength={6}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-[#008060] hover:bg-[#006e52] text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⌛</span>
                    {isSignUp ? "Creating account..." : "Signing in..."}
                  </span>
                ) : isSignUp ? (
                  "Create account"
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setEmail("");
                  setPassword("");
                }}
                className="text-sm text-[#008060] hover:text-[#006e52] hover:underline"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Auth;
