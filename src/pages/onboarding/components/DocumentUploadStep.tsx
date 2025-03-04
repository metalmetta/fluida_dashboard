
import { useState } from "react";
import KybDocumentUpload from "@/components/KybDocumentUpload";
import { KybDocument } from "@/hooks/use-kyb";

interface DocumentUploadStepProps {
  documents: KybDocument[];
  handleDocumentUpload: (file: File, documentType: string) => Promise<boolean>;
  isDocumentUploaded: (docType: string) => boolean;
}

export default function DocumentUploadStep({
  documents,
  handleDocumentUpload,
  isDocumentUploaded,
}: DocumentUploadStepProps) {
  return (
    <div className="space-y-6">
      <KybDocumentUpload
        documentType="certificate_of_incorporation"
        label="Certificate of Incorporation"
        description="Upload your official business registration certificate"
        onUpload={(file) => handleDocumentUpload(file, "certificate_of_incorporation")}
        uploaded={isDocumentUploaded("certificate_of_incorporation")}
      />
      
      <KybDocumentUpload
        documentType="proof_of_address"
        label="Proof of Business Address"
        description="Utility bill, bank statement, or official correspondence"
        onUpload={(file) => handleDocumentUpload(file, "proof_of_address")}
        uploaded={isDocumentUploaded("proof_of_address")}
      />
      
      <KybDocumentUpload
        documentType="director_id"
        label="Director's ID"
        description="Government-issued photo ID of the company director"
        onUpload={(file) => handleDocumentUpload(file, "director_id")}
        uploaded={isDocumentUploaded("director_id")}
      />
    </div>
  );
}
