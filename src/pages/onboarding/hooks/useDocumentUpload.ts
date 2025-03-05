
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useDocumentUpload() {
  const [businessLicense, setBusinessLicense] = useState<File | null>(null);
  const [incorporationCertificate, setIncorporationCertificate] = useState<File | null>(null);
  const [bankStatement, setBankStatement] = useState<File | null>(null);

  const uploadDocuments = async (userId: string) => {
    if (!userId) return;
    
    try {
      // Upload business license
      if (businessLicense) {
        const { error: licenseError } = await supabase.storage
          .from("kyb_documents")
          .upload(
            `${userId}/business_license_${Date.now()}`,
            businessLicense
          );
        if (licenseError) throw licenseError;
      }
      
      // Upload incorporation certificate
      if (incorporationCertificate) {
        const { error: certError } = await supabase.storage
          .from("kyb_documents")
          .upload(
            `${userId}/incorporation_certificate_${Date.now()}`,
            incorporationCertificate
          );
        if (certError) throw certError;
      }
      
      // Upload bank statement
      if (bankStatement) {
        const { error: statementError } = await supabase.storage
          .from("kyb_documents")
          .upload(
            `${userId}/bank_statement_${Date.now()}`,
            bankStatement
          );
        if (statementError) throw statementError;
      }
      
      // Update business details record to indicate documents uploaded
      await supabase
        .from("business_details")
        .update({ documents_uploaded: true })
        .eq("user_id", userId);
      
    } catch (error) {
      console.error("Error uploading documents:", error);
      throw error;
    }
  };

  return {
    businessLicense, setBusinessLicense,
    incorporationCertificate, setIncorporationCertificate,
    bankStatement, setBankStatement,
    uploadDocuments
  };
}
