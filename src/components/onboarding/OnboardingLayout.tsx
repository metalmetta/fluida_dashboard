
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/50 via-background to-secondary/50 p-4">
      <Card className="w-full max-w-3xl shadow-lg border-primary/10">
        <div className="p-6">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="Logo" className="h-16" />
          </div>

          <Progress value={progress} className="mb-6" />
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>

          {children}
        </div>
      </Card>
    </div>
  );
}
