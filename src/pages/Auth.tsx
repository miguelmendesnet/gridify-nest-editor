
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth state on component mount
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          if (error.message?.includes('refresh_token_not_found')) {
            // Clear any existing auth state
            await supabase.auth.signOut();
          }
          throw error;
        }
        if (session) {
          navigate('/');
        }
      } catch (error: any) {
        console.error('Session check error:', error);
        // Don't show error to user as this is just an initial check
      }
    };

    checkSession();
  }, [navigate]);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return null;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate password for signup
    if (isSignUp) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }
    }

    setLoading(true);

    try {
      const { data, error } = isSignUp
        ? await supabase.auth.signUp({ 
            email, 
            password,
            options: {
              emailRedirectTo: window.location.origin
            }
          })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      if (isSignUp) {
        if (data.user && !data.session) {
          toast.success("Check your email for the confirmation link!");
        } else {
          toast.success("Account created successfully!");
          navigate("/");
        }
      } else {
        toast.success("Successfully logged in!");
        navigate("/");
      }
    } catch (error: any) {
      let message = error.message;
      if (message.includes("Invalid refresh token")) {
        message = "Your session has expired. Please sign in again.";
      } else if (message.includes("weak_password")) {
        message = "Password should be at least 6 characters long";
      } else if (message.includes("Email not confirmed")) {
        message = "Please confirm your email address before signing in";
      }
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/50">
      <div className="w-full max-w-md p-8 space-y-6 bg-background rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">
          {isSignUp ? "Create an account" : "Sign in to your account"}
        </h1>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            {isSignUp && (
              <p className="text-sm text-muted-foreground mt-1">
                Password must be at least 6 characters long
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Loading..."
              : isSignUp
              ? "Create account"
              : "Sign in"}
          </Button>
        </form>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
          }}
        >
          {isSignUp
            ? "Already have an account? Sign in"
            : "Don't have an account? Sign up"}
        </Button>
      </div>
    </div>
  );
};

export default Auth;
