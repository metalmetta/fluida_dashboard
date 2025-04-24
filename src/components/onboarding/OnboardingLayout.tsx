
import { Card } from "@/components/ui/card";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Progress } from "@/components/ui/progress";

type OnboardingLayoutProps = {
  children: React.ReactNode;
  title: string;
  description: string;
};

export function OnboardingLayout({ children, title, description }: OnboardingLayoutProps) {
  const { currentStep, totalSteps } = useOnboarding();
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background p-4">
      <Card className="w-full max-w-3xl shadow-lg">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <img src="/logo.png" alt="Logo" className="h-16" />
          </div>

          <Progress value={progress} className="mb-8" />
          
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight mb-3">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>

          {children}
        </div>
      </Card>
    </div>
  );
}
