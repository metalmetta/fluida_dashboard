
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { useKyb, BusinessDetails } from "@/hooks/use-kyb";

export function useOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<BusinessDetails>({
    legal_name: "",
    registration_number: "",
    tax_id: "",
    address_line1: "",
    city: "",
    postal_code: "",
    country: "",
  });
  
  const navigate = useNavigate();
  const { session } = useAuth();
  const { 
    isLoading,
    documents,
    saveBusinessDetails,
    uploadDocument,
    fetchDocuments,
    fetchBusinessDetails,
    submitKybForReview
  } = useKyb();

  useEffect(() => {
    if (!session) {
      navigate("/auth");
      return;
    }

    const loadData = async () => {
      const businessData = await fetchBusinessDetails();
      if (businessData) {
        setFormData({
          legal_name: businessData.legal_name || "",
          registration_number: businessData.registration_number || "",
          tax_id: businessData.tax_id || "",
          address_line1: businessData.address_line1 || "",
          city: businessData.city || "",
          postal_code: businessData.postal_code || "",
          country: businessData.country || "",
        });
      }
      
      await fetchDocuments();
    };

    loadData();
  }, [session, navigate, fetchBusinessDetails, fetchDocuments]);

  const handleInputChange = (field: keyof BusinessDetails, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateCurrentStep = () => {
    if (currentStep === 0) {
      const { legal_name, registration_number, tax_id } = formData;
      if (!legal_name || !registration_number || !tax_id) {
        toast.error("Please fill in all required fields");
        return false;
      }
    } else if (currentStep === 1) {
      const { address_line1, city, postal_code, country } = formData;
      if (!address_line1 || !city || !postal_code || !country) {
        toast.error("Please fill in all required fields");
        return false;
      }
    } else if (currentStep === 2) {
      const requiredDocs = ["certificate_of_incorporation", "proof_of_address", "director_id"];
      const uploadedDocs = documents.map(doc => doc.document_type);
      
      const missingDocs = requiredDocs.filter(doc => !uploadedDocs.includes(doc));
      
      if (missingDocs.length > 0) {
        toast.error(`Please upload all required documents: ${missingDocs.join(", ")}`);
        return false;
      }
    }
    
    return true;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep === 0 || currentStep === 1) {
      const saved = await saveBusinessDetails(formData);
      if (!saved) return;
    }
    
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const success = await submitKybForReview();
    if (success) {
      navigate("/pending-approval");
    }
  };

  const handleDocumentUpload = async (file: File, documentType: string) => {
    return await uploadDocument(file, documentType);
  };

  const isDocumentUploaded = (docType: string) => {
    return documents.some(doc => doc.document_type === docType);
  };

  return {
    currentStep,
    formData,
    documents,
    isLoading,
    handleInputChange,
    handleNext,
    handlePrevious,
    handleSubmit,
    handleDocumentUpload,
    isDocumentUploaded
  };
}
