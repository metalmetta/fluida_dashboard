
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  fields: {
    id: string;
    label: string;
    type: string;
    placeholder: string;
    required: boolean;
  }[];
};

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "company-details",
    title: "Company Details",
    description: "Let's start with some basic information about your business.",
    fields: [
      {
        id: "legal_name",
        label: "Legal Company Name",
        type: "text",
        placeholder: "e.g. Acme Corporation",
        required: true,
      },
      {
        id: "registration_number",
        label: "Business Registration Number",
        type: "text",
        placeholder: "e.g. 12345678",
        required: true,
      },
      {
        id: "tax_id",
        label: "Tax ID Number",
        type: "text",
        placeholder: "e.g. ABC-123-456",
        required: true,
      },
    ],
  },
  {
    id: "business-address",
    title: "Business Address",
    description: "Provide your registered business address.",
    fields: [
      {
        id: "address_line1",
        label: "Address Line 1",
        type: "text",
        placeholder: "e.g. 123 Business Road",
        required: true,
      },
      {
        id: "city",
        label: "City",
        type: "text",
        placeholder: "e.g. New York",
        required: true,
      },
      {
        id: "postal_code",
        label: "Postal Code",
        type: "text",
        placeholder: "e.g. 10001",
        required: true,
      },
      {
        id: "country",
        label: "Country",
        type: "text",
        placeholder: "e.g. United States",
        required: true,
      },
    ],
  },
  {
    id: "document-upload",
    title: "Document Upload",
    description: "Please upload the required documents for verification.",
    fields: [
      {
        id: "certificate_of_incorporation",
        label: "Certificate of Incorporation",
        type: "file",
        placeholder: "Upload PDF or image",
        required: true,
      },
      {
        id: "proof_of_address",
        label: "Proof of Address",
        type: "file",
        placeholder: "Upload PDF or image",
        required: true,
      },
      {
        id: "director_id",
        label: "Director ID",
        type: "file",
        placeholder: "Upload PDF or image",
        required: true,
      },
    ],
  },
];

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  if (!session) {
    return <div>Loading...</div>;
  }

  const handleInputChange = (fieldId: string, value: string | File) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleFileChange = (fieldId: string, files: FileList | null) => {
    if (files && files.length > 0) {
      handleInputChange(fieldId, files[0]);
    }
  };

  const handleNext = () => {
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
    setIsSubmitting(true);
    try {
      // In a real implementation, you would upload documents to storage
      // and store document metadata in the database
      
      // For demo purposes, we'll just update the user's metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          kyb_data: formData,
          business_status: "kyb_submitted",
          kyb_submitted_at: new Date().toISOString(),
        },
      });

      if (error) throw error;

      toast.success("KYB verification submitted for review!");
      navigate("/pending-approval");
    } catch (error: any) {
      toast.error("Error submitting KYB verification: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center">Business Verification</h1>
          <p className="text-gray-500 text-center mt-2">
            Complete the steps below to verify your business
          </p>
          <div className="mt-6 flex justify-center">
            <div className="flex items-center w-full max-w-sm">
              {ONBOARDING_STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
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
                      className={`h-1 w-12 ${
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
            <CardTitle>{currentStepData.title}</CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              {currentStepData.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>{field.label}</Label>
                  {field.type === "file" ? (
                    <Input
                      id={field.id}
                      type="file"
                      onChange={(e) => handleFileChange(field.id, e.target.files)}
                      required={field.required}
                    />
                  ) : (
                    <Input
                      id={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            {isLastStep ? (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit for Verification"}
              </Button>
            ) : (
              <Button onClick={handleNext}>Next</Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
