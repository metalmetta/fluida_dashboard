import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function ReviewStep() {
  const { 
    onboardingData, 
    setCurrentStep,
    submitOnboardingData,
    isSubmitting,
    error,
  } = useOnboarding();
  const { setIsNewUser } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async () => {
    try {
      await submitOnboardingData();
      navigate("/");
    } catch (error) {
      console.error("Failed to submit onboarding data:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Review Your Information</h3>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="font-medium">Legal Name:</dt>
                <dd>{onboardingData.companyInformation.legalName}</dd>
              </div>
              <div>
                <dt className="font-medium">Registration Number:</dt>
                <dd>{onboardingData.companyInformation.registrationNumber}</dd>
              </div>
              <div>
                <dt className="font-medium">Tax ID:</dt>
                <dd>{onboardingData.companyInformation.taxIdentificationValue}</dd>
              </div>
              <div>
                <dt className="font-medium">Business Sector:</dt>
                <dd>{onboardingData.companyInformation.businessSector}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Address</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="text-sm">
              <dt className="font-medium">Registered Address:</dt>
              <dd>
                {onboardingData.registeredAddress.streetLine1}, {onboardingData.registeredAddress.city}, {onboardingData.registeredAddress.stateProvinceRegion} {onboardingData.registeredAddress.postalCode}
              </dd>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Ultimate Beneficial Owner</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="font-medium">Name:</dt>
                <dd>{onboardingData.ultimateBeneficialOwners[0].firstName} {onboardingData.ultimateBeneficialOwners[0].lastName}</dd>
              </div>
              <div>
                <dt className="font-medium">Title:</dt>
                <dd>{onboardingData.ultimateBeneficialOwners[0].title}</dd>
              </div>
              <div>
                <dt className="font-medium">Email:</dt>
                <dd>{onboardingData.ultimateBeneficialOwners[0].email}</dd>
              </div>
              <div>
                <dt className="font-medium">Phone:</dt>
                <dd>{onboardingData.ultimateBeneficialOwners[0].phone}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="font-medium">Email:</dt>
                <dd>{onboardingData.contactInformation.email}</dd>
              </div>
              <div>
                <dt className="font-medium">Phone:</dt>
                <dd>{onboardingData.contactInformation.phoneNumber}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => setCurrentStep(4)} disabled={isSubmitting}>
          Back
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Complete Onboarding
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
