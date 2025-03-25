
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: string;
  email: string;
  fullName: string;
  companyName: string;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, companyName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // This is a mock authentication - in a real app, you would call an API
      // Simulate API call delay
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock validation - in a real app, this would be handled by your auth provider
      if (email === "demo@example.com" && password === "password") {
        const userData = {
          id: "user-1",
          email,
          fullName: "Demo User",
          companyName: "Demo Company",
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        
        toast({
          title: "Logged in successfully",
          description: "Welcome back!",
        });
        
        navigate("/");
      } else {
        throw new Error("Invalid email or password");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, companyName: string) => {
    try {
      // This is a mock registration - in a real app, you would call an API
      setIsLoading(true);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Create a new user (this is mocked)
      const userData = {
        id: `user-${Date.now()}`,
        email,
        fullName,
        companyName,
      };
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      
      toast({
        title: "Account created successfully",
        description: "Welcome to the platform!",
      });
      
      navigate("/");
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    setUser(null);
    localStorage.removeItem("user");
    
    toast({
      title: "Logged out successfully",
      description: "See you again soon!",
    });
    
    navigate("/auth/login");
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}
