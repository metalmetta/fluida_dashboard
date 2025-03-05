
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { BusinessDetails } from "@/types/column.types";

// Components
import { ProgressSteps } from "./components/ProgressSteps";
import { CompanyDetailsForm } from "./components/CompanyDetailsForm";
import { BusinessAddressForm } from "./components/BusinessAddressForm";
import { DocumentUploadForm } from "./components/DocumentUploadForm";
import { ReviewSubmitForm } from "./components/ReviewSubmitForm";

// Hooks & Services
import { useBusinessDetails } from "./hooks/useBusinessDetails";
import { useDocumentUpload } from "./hooks/useDocumentUpload";
import { createColumnEntityAndAccount } from "./services/columnService";

export default function Onboarding() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load business details using the custom hook
  const {
    companyName, setCompanyName,
    industry, setIndustry,
    website, setWebsite,
    phoneNumber, setPhoneNumber,
    taxId, setTaxId,
    description, setDescription,
    street, setStreet,
    city, setCity,
    state, setState,
    postalCode, setPostalCode,
    country, setCountry,
    saveBusinessDetails
  } = useBusinessDetails(session);
  
  // Load document upload functionality
  const {
    businessLicense, setBusinessLicense,
    incorporationCertificate, setIncorporationCertificate,
    bankStatement, setBankStatement,
    uploadDocuments
  } = useDocumentUpload();
  
  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      await saveBusinessDetails();
      
      if (currentStep === 3) {
        if (session?.user) {
          await uploadDocuments(session.user.id);
        }
      }
      
      if (currentStep === 4) {
        // Final step - create Column entity and bank account
        if (session?.user) {
          const columnBusinessDetails: BusinessDetails = {
            companyName,
            street,
            city,
            state,
            postalCode,
            country,
            phone: phoneNumber,
            email: session.user.email || "",
            taxId,
          };
          
          await createColumnEntityAndAccount(session.user.id, columnBusinessDetails);
          
          // Update user metadata
          await supabase.auth.updateUser({
            data: {
              business_status: "approved" // Auto-approve for demo purposes
            }
          });
        }
        
        toast.success("Business onboarding complete! Your account is now active.");
        navigate("/");
        return;
      }
      
      setCurrentStep(prev => prev + 1);
      toast.success("Information saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CompanyDetailsForm
            companyName={companyName}
            setCompanyName={setCompanyName}
            industry={industry}
            setIndustry={setIndustry}
            website={website}
            setWebsite={setWebsite}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            taxId={taxId}
            setTaxId={setTaxId}
            description={description}
            setDescription={setDescription}
          />
        );
      
      case 2:
        return (
          <BusinessAddressForm
            street={street}
            setStreet={setStreet}
            city={city}
            setCity={setCity}
            state={state}
            setState={setState}
            postalCode={postalCode}
            setPostalCode={setPostalCode}
            country={country}
            setCountry={setCountry}
          />
        );
      
      case 3:
        return (
          <DocumentUploadForm
            businessLicense={businessLicense}
            setBusinessLicense={setBusinessLicense}
            incorporationCertificate={incorporationCertificate}
            setIncorporationCertificate={setIncorporationCertificate}
            bankStatement={bankStatement}
            setBankStatement={setBankStatement}
          />
        );
      
      case 4:
        return (
          <ReviewSubmitForm
            companyName={companyName}
            industry={industry}
            website={website}
            phoneNumber={phoneNumber}
            taxId={taxId}
            street={street}
            city={city}
            state={state}
            postalCode={postalCode}
            country={country}
            businessLicense={businessLicense}
            incorporationCertificate={incorporationCertificate}
            bankStatement={bankStatement}
          />
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Business Verification</h1>
        
        {/* Progress Steps */}
        <ProgressSteps currentStep={currentStep} />
        
        {/* Content Area */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          {renderStep()}
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
            disabled={currentStep === 1 || isLoading}
          >
            Back
          </Button>
          
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading
              ? "Processing..."
              : currentStep === 4
              ? "Submit & Create Account"
              : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
