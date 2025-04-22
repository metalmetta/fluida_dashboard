
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  error: string | null;
}

export function ErrorState({ error }: ErrorStateProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="p-6 max-w-md text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="text-xl font-semibold mb-2">Error</h1>
        <p className="text-gray-600 mb-4">{error || "Invoice not found"}</p>
        <button
          onClick={() => navigate("/")}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
        >
          Return to Dashboard
        </button>
      </Card>
    </div>
  );
}
