import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactConfetti from "react-confetti";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, companyName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isNewUser: boolean;
  setIsNewUser: (isNew: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Hide confetti after 5 seconds
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createInitialUserBalance = async (userId: string) => {
    try {
      // Using upsert (insert with on conflict) to prevent duplicate key errors
      const { error } = await supabase
        .from("user_balances")
        .upsert([{ 
          user_id: userId, 
          available_amount: 0,
          currency: "USD" 
        }], { 
          onConflict: 'user_id' 
        });
      
      if (error) {
        console.error("Error creating initial user balance:", error);
      } else {
        console.log("Created or updated initial balance for user:", userId);
      }
    } catch (error) {
      console.error("Exception creating initial user balance:", error);
    }
  };

  const checkEmailWhitelist = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('email_whitelist')
        .select('email')
        .eq('email', email)
        .maybeSingle();
      
      if (error) {
        console.error("Error checking email whitelist:", error);
        return false;
      }
      
      return !!data; // Return true if the email was found, false otherwise
    } catch (error) {
      console.error("Exception checking email whitelist:", error);
      return false;
    }
  };

  const signUp = async (email: string, password: string, fullName: string, companyName?: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
          },
        },
      });

      if (error) throw error;

      // Create initial balance with 0 amount for the new user
      if (data?.user) {
        await createInitialUserBalance(data.user.id);
      }

      // Show confetti animation
      setShowConfetti(true);
      
      // Check if the email is in the whitelist
      const isWhitelisted = await checkEmailWhitelist(email);
      
      // Set isNewUser flag based on whitelist check
      setIsNewUser(!isWhitelisted);
      
      toast({
        title: "Account created",
        description: isWhitelisted 
          ? "You have been signed up successfully. Welcome to the platform!"
          : "You have been signed up successfully. Let's complete your profile.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      signIn, 
      signUp, 
      signOut, 
      isNewUser, 
      setIsNewUser 
    }}>
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          gravity={0.15}
        />
      )}
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
