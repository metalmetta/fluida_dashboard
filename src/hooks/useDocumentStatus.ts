
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export interface UseDocumentStatusProps<T extends string> {
  documentId: string | undefined;
  initialStatus: T | undefined;
  onStatusChange: (documentId: string, newStatus: T) => Promise<void>;
  documentType: string;
}

export function useDocumentStatus<T extends string>({
  documentId,
  initialStatus,
  onStatusChange,
  documentType
}: UseDocumentStatusProps<T>) {
  const { toast } = useToast();
  const [status, setStatus] = useState<T | undefined>(initialStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  // Update internal status when document changes
  useEffect(() => {
    if (initialStatus) {
      setStatus(initialStatus);
    }
  }, [initialStatus]);

  const handleUpdateStatus = async () => {
    if (!documentId || !status) return;
    
    setIsUpdating(true);
    
    try {
      await onStatusChange(documentId, status);
      toast({
        title: "Status updated",
        description: `${documentType} status changed to ${status}.`
      });
    } catch (error) {
      console.error(`Error updating ${documentType} status:`, error);
      toast({
        title: "Error",
        description: `Failed to update ${documentType} status.`,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    status,
    setStatus,
    isUpdating,
    handleUpdateStatus
  };
}
