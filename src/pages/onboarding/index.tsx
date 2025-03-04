
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { useKyb, BusinessDetails } from "@/hooks/use-kyb";
import KybDocumentUpload from "@/components/KybDocumentUpload";

// Define the steps for the onboarding process
type OnboardingStep = {
  id: string;
  title: string;
  description: string;
};

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "company-details",
    title: "Company Details",
    description: "Let's start with some basic information about your business.",
  },
  {
    id: "business-address",
    title: "Business Address",
    description: "Provide your registered business address.",
  },
  {
    id: "document-upload",
    title: "Document Upload",
    description: "Please upload the required documents for verification.",
  },
  {
    id: "review-submit",
    title: "Review & Submit",
    description: "Review your information before submitting for verification.",
  },
];

export default function OnboardingFlow() {
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

    // Load existing data if any
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
      // Validate company details
      const { legal_name, registration_number, tax_id } = formData;
      if (!legal_name || !registration_number || !tax_id) {
        toast.error("Please fill in all required fields");
        return false;
      }
    } else if (currentStep === 1) {
      // Validate business address
      const { address_line1, city, postal_code, country } = formData;
      if (!address_line1 || !city || !postal_code || !country) {
        toast.error("Please fill in all required fields");
        return false;
      }
    } else if (currentStep === 2) {
      // Validate document uploads
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
      // Save business details when moving from step 1 or 2
      const saved = await saveBusinessDetails(formData);
      if (!saved) return;
    }
    
    if (currentStep < ONBOARDING_STEPS.length - 1) {
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

  const renderStep = () => {
    const step = ONBOARDING_STEPS[currentStep];

    switch (step.id) {
      case "company-details":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="legal_name">Legal Company Name</Label>
              <Input
                id="legal_name"
                value={formData.legal_name}
                onChange={(e) => handleInputChange("legal_name", e.target.value)}
                placeholder="e.g. Acme Corporation"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="registration_number">Business Registration Number</Label>
              <Input
                id="registration_number"
                value={formData.registration_number}
                onChange={(e) => handleInputChange("registration_number", e.target.value)}
                placeholder="e.g. 12345678"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tax_id">Tax ID Number</Label>
              <Input
                id="tax_id"
                value={formData.tax_id}
                onChange={(e) => handleInputChange("tax_id", e.target.value)}
                placeholder="e.g. ABC-123-456"
                required
              />
            </div>
          </div>
        );
        
      case "business-address":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address_line1">Address Line 1</Label>
              <Input
                id="address_line1"
                value={formData.address_line1}
                onChange={(e) => handleInputChange("address_line1", e.target.value)}
                placeholder="e.g. 123 Business Road"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="e.g. New York"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => handleInputChange("postal_code", e.target.value)}
                placeholder="e.g. 10001"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select 
                value={formData.country} 
                onValueChange={(value) => handleInputChange("country", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="JP">Japan</SelectItem>
                  <SelectItem value="SG">Singapore</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      case "document-upload":
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
        
      case "review-submit":
        return (
          <div className="space-y-6">
            <div className="rounded-md border p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Company Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Legal Name:</div>
                <div>{formData.legal_name}</div>
                <div className="text-gray-500">Registration Number:</div>
                <div>{formData.registration_number}</div>
                <div className="text-gray-500">Tax ID:</div>
                <div>{formData.tax_id}</div>
              </div>
            </div>
            
            <div className="rounded-md border p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Business Address</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Address:</div>
                <div>{formData.address_line1}</div>
                <div className="text-gray-500">City:</div>
                <div>{formData.city}</div>
                <div className="text-gray-500">Postal Code:</div>
                <div>{formData.postal_code}</div>
                <div className="text-gray-500">Country:</div>
                <div>{formData.country}</div>
              </div>
            </div>
            
            <div className="rounded-md border p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Submitted Documents</h3>
              <ul className="space-y-1 text-sm">
                {documents.map((doc) => (
                  <li key={doc.id} className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="capitalize">{doc.document_type.replace(/_/g, ' ')}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="rounded-md bg-blue-50 border border-blue-100 p-4">
              <p className="text-blue-800 text-sm">
                By submitting this application, you confirm that all information provided is accurate and complete.
                We will review your documents and may contact you for additional information if needed.
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (!session) {
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
          <div className="mt-6 flex justify-center">
            <div className="flex items-center w-full max-w-lg">
              {ONBOARDING_STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index <= currentStep
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < ONBOARDING_STEPS.length - 1 && (
                    <div
                      className={`h-1 w-full ${
                        index < currentStep ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
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
