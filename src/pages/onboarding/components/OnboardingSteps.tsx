
import { OnboardingStep } from "../types";

interface OnboardingStepsProps {
  steps: OnboardingStep[];
  currentStep: number;
}

export default function OnboardingSteps({ steps, currentStep }: OnboardingStepsProps) {
  return (
    <div className="flex justify-center">
      <div className="flex items-center w-full max-w-lg">
        {steps.map((step, index) => (
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
            {index < steps.length - 1 && (
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
  );
}
