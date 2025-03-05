import { cn } from "@/lib/utils";
import { CheckCircle2, CircleDot } from "lucide-react";

interface Step {
  number: number;
  title: string;
  description?: string;
}

interface OnboardingStepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function OnboardingStepper({ steps, currentStep, className }: OnboardingStepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.number} className="flex flex-1 items-center">
              <div className="relative flex flex-col items-center flex-1">
                {/* Step Circle */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                    isCompleted && "bg-primary border-primary",
                    isCurrent && "border-primary",
                    !isCompleted && !isCurrent && "border-muted"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-primary-foreground animate-in fade-in-50" />
                  ) : isCurrent ? (
                    <CircleDot className="w-6 h-6 text-primary animate-pulse" />
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">{step.number}</span>
                  )}
                </div>

                {/* Connecting Line */}
                {!isLast && (
                  <div
                    className={cn(
                      "absolute top-5 left-1/2 w-full h-[2px] transition-all duration-200",
                      isCompleted ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}

                {/* Step Title */}
                <div className="absolute -bottom-8 w-32 text-center">
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors duration-200",
                      isCurrent && "text-primary",
                      isCompleted && "text-primary",
                      !isCompleted && !isCurrent && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 