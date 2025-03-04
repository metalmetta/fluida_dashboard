
export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
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
