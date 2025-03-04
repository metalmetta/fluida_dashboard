
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type BusinessDetails = {
  legal_name: string;
  registration_number: string;
  tax_id: string;
  address_line1: string;
  city: string;
  postal_code: string;
  country: string;
};

export type KybDocument = {
  id: string;
  document_type: string;
  file_name: string;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_at: string;
};

export const useKyb = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<KybDocument[]>([]);
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null);

  const saveBusinessDetails = async (details: BusinessDetails) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('business_details')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          ...details
        }, { onConflict: 'user_id' });

      if (error) throw error;
      
      toast.success("Business details saved successfully");
      return true;
    } catch (error: any) {
      toast.error("Error saving business details: " + error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadDocument = async (file: File, documentType: string) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-kyb-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to upload document");
      }

      toast.success(`${documentType} uploaded successfully`);
      await fetchDocuments();
      return true;
    } catch (error: any) {
      toast.error("Error uploading document: " + error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('kyb_documents')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      
      setDocuments(data || []);
      return data;
    } catch (error: any) {
      toast.error("Error fetching documents: " + error.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBusinessDetails = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_details')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows returned" error
      
      if (data) {
        setBusinessDetails(data);
      }
      return data;
    } catch (error: any) {
      toast.error("Error fetching business details: " + error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const submitKybForReview = async () => {
    setIsLoading(true);
    try {
      // Update business status in both the user metadata and business_details table
      const now = new Date().toISOString();
      
      // Update user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          business_status: "kyb_submitted",
          kyb_submitted_at: now,
        },
      });

      if (authError) throw authError;

      // Update business_details table
      const { error: dbError } = await supabase
        .from('business_details')
        .update({ 
          status: 'kyb_submitted',
          submitted_at: now 
        })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (dbError) throw dbError;
      
      toast.success("KYB verification submitted for review!");
      return true;
    } catch (error: any) {
      toast.error("Error submitting KYB verification: " + error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    documents,
    businessDetails,
    saveBusinessDetails,
    uploadDocument,
    fetchDocuments,
    fetchBusinessDetails,
    submitKybForReview
  };
};
