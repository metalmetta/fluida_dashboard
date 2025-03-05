
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { BusinessDetails } from "@/types/column.types";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const navigate = useNavigate();
  const { session } = useAuth();

  // Redirect if already logged in
  if (session) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // For signup, we'll include company name in user metadata
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              company_name: companyName,
              business_status: "pending_kyb", // Initial status for all businesses
            },
          },
        });
        
        if (error) throw error;
        
        // Only proceed if signup was successful
        if (data.user) {
          // Create entry in business_details table
          const { error: businessError } = await supabase
            .from("business_details")
            .insert({
              user_id: data.user.id,
              legal_name: companyName,
              status: "pending_kyb",
              country: "US", // Default values
              postal_code: "",
              city: "",
              address_line1: "",
              tax_id: "",
              registration_number: ""
            });
            
          if (businessError) {
            console.error("Error creating business record:", businessError);
            toast.error("Account created but couldn't initialize business profile");
          } else {
            console.log("Business record created successfully");
          }
          
          toast.success("Account created! Proceeding to KYB verification.");
          navigate("/onboarding");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        // After login, check business status and redirect accordingly
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.user_metadata?.business_status === "pending_kyb") {
          toast.info("Please complete your KYB verification.");
          navigate("/onboarding");
        } else {
          navigate("/");
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold text-center mb-6">
          {isSignUp ? "Create a business account" : "Welcome back"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Your Company Ltd."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required={isSignUp}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Business Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="business@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? "Loading..."
              : isSignUp
              ? "Create business account"
              : "Sign in"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </Card>
    </div>
  );
}
