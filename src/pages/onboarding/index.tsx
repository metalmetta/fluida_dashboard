
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "./hooks/useOnboarding";
import { ONBOARDING_STEPS } from "./types";
import OnboardingSteps from "./components/OnboardingSteps";
import CompanyDetailsStep from "./components/CompanyDetailsStep";
import BusinessAddressStep from "./components/BusinessAddressStep";
import DocumentUploadStep from "./components/DocumentUploadStep";
import ReviewSubmitStep from "./components/ReviewSubmitStep";

export default function OnboardingFlow() {
  const {
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
  } = useOnboarding();

  const renderStep = () => {
    const step = ONBOARDING_STEPS[currentStep];

    switch (step.id) {
      case "company-details":
        return (
          <CompanyDetailsStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
        
      case "business-address":
        return (
          <BusinessAddressStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
        
      case "document-upload":
        return (
          <DocumentUploadStep
            documents={documents}
            handleDocumentUpload={handleDocumentUpload}
            isDocumentUploaded={isDocumentUploaded}
          />
        );
        
      case "review-submit":
        return (
          <ReviewSubmitStep
            formData={formData}
            documents={documents}
          />
        );
        
      default:
        return null;
    }
  };

  // Show redirect message if not authenticated
  if (!documents) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center">Business Verification</h1>
          <p className="text-gray-500 text-center mt-2">
            Complete the steps below to verify your business
          </p>
          <div className="mt-6">
            <OnboardingSteps steps={ONBOARDING_STEPS} currentStep={currentStep} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{ONBOARDING_STEPS[currentStep].title}</CardTitle>
            <CardDescription>{ONBOARDING_STEPS[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0 || isLoading}
            >
              Previous
            </Button>
            
            {currentStep === ONBOARDING_STEPS.length - 1 ? (
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit for Verification"}
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Next"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
