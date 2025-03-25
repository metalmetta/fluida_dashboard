
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

type AuthLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
};

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <img src="/logo.png" alt="Logo" className="h-28 w-auto" />
        </div>
        <Card className="border-none shadow-lg">
          <CardContent className="p-6 pt-6">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              <p className="mt-1 text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
