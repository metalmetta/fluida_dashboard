
import { useOnboarding } from "@/contexts/OnboardingContext";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { CompanyInformationStep } from "@/components/onboarding/CompanyInformationStep";
import { AddressStep } from "@/components/onboarding/AddressStep";
import { UboStep } from "@/components/onboarding/UboStep";
import { ContactStep } from "@/components/onboarding/ContactStep";
import { ReviewStep } from "@/components/onboarding/ReviewStep";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";

export default function Onboarding() {
  const { currentStep } = useOnboarding();
  const { user, isNewUser, setIsNewUser } = useAuth();
  
  // Redirect to dashboard if user is not new
  if (!user || !isNewUser) {
    return <Navigate to="/" replace />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <OnboardingLayout 
            title="Company Information" 
            description="Please provide your business details to get started."
          >
            <CompanyInformationStep />
          </OnboardingLayout>
        );
      case 2:
        return (
          <OnboardingLayout 
            title="Business Address" 
            description="Please provide your registered business address."
          >
            <AddressStep />
          </OnboardingLayout>
        );
      case 3:
        return (
          <OnboardingLayout 
            title="Ultimate Beneficial Owner" 
            description="Please provide information about the beneficial owner(s) of your business."
          >
            <UboStep />
          </OnboardingLayout>
        );
      case 4:
        return (
          <OnboardingLayout 
            title="Contact Information" 
            description="Please provide your business contact information."
          >
            <ContactStep />
          </OnboardingLayout>
        );
      case 5:
        return (
          <OnboardingLayout 
            title="Review & Submit" 
            description="Please review your information before submitting."
          >
            <ReviewStep />
          </OnboardingLayout>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderStep()}
      <Toaster />
    </>
  );
}
