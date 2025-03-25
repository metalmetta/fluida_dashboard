
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Contact } from "@/types/contact";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchContacts = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setContacts(data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Error",
        description: "Failed to load contacts. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSampleContacts = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add sample contacts",
        variant: "destructive"
      });
      return;
    }

    try {
      const sampleContacts = [
        {
          user_id: user.id,
          name: "John Doe",
          company: "Tech Innovations",
          email: "john@techinnovations.com",
          phone: "+1 (555) 123-4567",
          type: "Customer" as const
        },
        {
          user_id: user.id,
          name: "Jane Smith",
          company: "Global Solutions",
          email: "jane@globalsolutions.com",
          phone: "+1 (555) 987-6543",
          type: "Vendor" as const
        },
        {
          user_id: user.id,
          name: "Robert Johnson",
          company: "Design Masters",
          email: "robert@designmasters.com",
          phone: "+1 (555) 456-7890",
          type: "Customer" as const
        },
        {
          user_id: user.id,
          name: "Sarah Williams",
          company: "Marketing Pros",
          email: "sarah@marketingpros.com",
          phone: "+1 (555) 234-5678",
          type: "Vendor" as const
        },
        {
          user_id: user.id,
          name: "Michael Brown",
          company: "Finance Experts",
          email: "michael@financeexperts.com",
          phone: "+1 (555) 876-5432",
          type: "Other" as const
        }
      ];

      const { error } = await supabase.from("contacts").insert(sampleContacts);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Sample contacts added successfully"
      });

      // Fetch the updated contacts
      fetchContacts();
    } catch (error) {
      console.error("Error adding sample contacts:", error);
      toast({
        title: "Error",
        description: "Failed to add sample contacts",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  return { 
    contacts, 
    isLoading, 
    fetchContacts, 
    addSampleContacts 
  };
}
