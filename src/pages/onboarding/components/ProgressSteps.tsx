
interface ProgressStepsProps {
  currentStep: number;
}

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  return (
    <div className="flex justify-between mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div
          key={step}
          className={`flex flex-col items-center ${
            currentStep >= step ? "text-blue-600" : "text-gray-400"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
              currentStep >= step
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {step}
          </div>
          <span className="text-sm">
            {step === 1
              ? "Company Details"
              : step === 2
              ? "Business Address"
              : step === 3
              ? "Document Upload"
              : "Review & Submit"}
          </span>
        </div>
      ))}
    </div>
  );
}
