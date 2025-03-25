
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Mail, Copy, Download } from "lucide-react";
import { 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export interface DocumentSidebarProps {
  title: string;
  status: string;
  statuses: { value: string; label: string }[];
  isUpdating: boolean;
  onStatusChange: (status: string) => void;
  onUpdate: () => Promise<void>;
  documentId?: string;
}

export function DocumentSidebar({
  title,
  status,
  statuses,
  isUpdating,
  onStatusChange,
  onUpdate,
  documentId
}: DocumentSidebarProps) {
  const { toast } = useToast();

  const handleSendEmail = () => {
    toast({
      title: "Email sent",
      description: `${title} has been sent.`
    });
  };

  const handleCopyPaymentLink = () => {
    // Create a payment link (this would be a real link in production)
    const paymentLink = `https://pay.example.com/${title.toLowerCase()}/${documentId}`;
    navigator.clipboard.writeText(paymentLink);
    
    toast({
      title: "Link copied",
      description: "Payment link copied to clipboard."
    });
  };

  const handleDownloadPDF = () => {
    toast({
      title: "Downloading PDF",
      description: `Your ${title.toLowerCase()} PDF is being downloaded.`
    });
  };

  return (
    <div className="md:w-1/3 p-6 border-r space-y-4">
      <DialogHeader>
        <DialogTitle>View {title.toLowerCase()}</DialogTitle>
      </DialogHeader>
      
      <div className="flex flex-col space-y-3 mt-6">
        <Button onClick={handleSendEmail} className="justify-start">
          <Mail className="mr-2 h-4 w-4" />
          Send email
        </Button>
        
        <Button variant="outline" onClick={handleCopyPaymentLink} className="justify-start">
          <Copy className="mr-2 h-4 w-4" />
          Copy payment link
        </Button>
        
        <Button variant="outline" onClick={handleDownloadPDF} className="justify-start">
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
      
      <div className="space-y-2 mt-6">
        <label htmlFor="status" className="block text-sm font-medium">
          Status
        </label>
        <Select
          value={status}
          onValueChange={onStatusChange}
          disabled={isUpdating}
        >
          <SelectTrigger id="status" className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((statusOption) => (
              <SelectItem key={statusOption.value} value={statusOption.value}>
                {statusOption.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <DialogFooter className="mt-8">
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button 
          variant="default" 
          onClick={onUpdate} 
          disabled={isUpdating}
        >
          {isUpdating ? "Updating..." : "Update"}
        </Button>
      </DialogFooter>
    </div>
  );
}
