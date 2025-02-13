
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }}) => {
      console.log("Current session:", session); // Debug log
      if (session) {
        navigate("/");
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session); // Debug log
      if (session) {
        navigate("/");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        console.log("Attempting to sign up with email:", email); // Debug log
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });
        
        if (error) {
          console.error("Sign up error:", error); // Debug log
          throw error;
        }
        
        console.log("Sign up successful:", data); // Debug log
        
        toast({
          title: "Account created",
          description: "You can now sign in with your credentials.",
        });
        
        // Clear form after successful signup
        setEmail("");
        setPassword("");
        setIsSignUp(false);
      } else {
        console.log("Attempting to sign in with email:", email); // Debug log
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error("Sign in error:", error); // Debug log
          throw error;
        }
        
        console.log("Sign in successful:", data); // Debug log
        navigate("/");
      }
    } catch (error: any) {
      console.error("Auth error:", error); // Debug log
      
      let errorMessage = error.message;
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = isSignUp 
          ? "Failed to create account. Please try again."
          : "Invalid email or password. If you haven't created an account yet, please sign up first.";
      } else if (error.message.includes("Email rate limit exceeded")) {
        errorMessage = "Too many attempts. Please try again later.";
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
    <div className="min-h-screen bg-[#F6F6F7] flex items-center justify-center">
      <div className="w-full max-w-[400px] px-4">
        <Card className="w-full shadow-sm border-0">
          <CardHeader className="space-y-1 p-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              {isSignUp ? "Create an Account" : "Welcome Back"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isSignUp
                ? "Sign up to start creating exposes"
                : "Sign in to your account"}
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#008060] hover:bg-[#006e52] text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⌛</span>
                    {isSignUp ? "Creating Account..." : "Signing In..."}
                  </span>
                ) : isSignUp ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setEmail("");
                  setPassword("");
                }}
                className="text-sm text-[#006e52] hover:underline"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Need an account? Sign up"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Auth;
