
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Invoice } from "@/types/invoice";
import { Mail, Copy, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ViewInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  onStatusChange: (invoiceId: string, newStatus: Invoice['status']) => Promise<void>;
}

export function ViewInvoiceDialog({ 
  open, 
  onOpenChange, 
  invoice, 
  onStatusChange 
}: ViewInvoiceDialogProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<Invoice['status']>(invoice?.status || 'draft');
  const [isUpdating, setIsUpdating] = useState(false);

  // Update internal status when invoice changes
  React.useEffect(() => {
    if (invoice) {
      setStatus(invoice.status);
    }
  }, [invoice]);

  const handleStatusChange = async (newStatus: Invoice['status']) => {
    if (!invoice) return;
    
    setStatus(newStatus);
    setIsUpdating(true);
    
    try {
      await onStatusChange(invoice.id, newStatus);
      toast({
        title: "Status updated",
        description: `Invoice status changed to ${newStatus}.`
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update invoice status.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendEmail = () => {
    toast({
      title: "Email sent",
      description: "Invoice has been sent to the client."
    });
  };

  const handleCopyPaymentLink = () => {
    // Create a payment link (this would be a real link in production)
    const paymentLink = `https://pay.example.com/invoice/${invoice?.id}`;
    navigator.clipboard.writeText(paymentLink);
    
    toast({
      title: "Link copied",
      description: "Payment link copied to clipboard."
    });
  };

  const handleDownloadPDF = () => {
    toast({
      title: "Downloading PDF",
      description: "Your invoice PDF is being downloaded."
    });
    
    // In a real app, this would trigger an actual download
    // For now, let's just show a toast message
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl flex flex-col md:flex-row gap-4 p-0">
        <div className="md:w-1/3 p-6 border-r space-y-4">
          <DialogHeader>
            <DialogTitle>View invoice</DialogTitle>
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
              onValueChange={(value) => handleStatusChange(value as Invoice['status'])}
              disabled={isUpdating}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="mt-8">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="default">Update</Button>
          </DialogFooter>
        </div>
        
        <div className="md:w-2/3 bg-gray-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white shadow-lg rounded-md">
            {/* Mock invoice preview */}
            <div className="p-6 border-b">
              <div className="flex justify-between">
                <div>
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold">
                    {invoice.client_name.charAt(0)}
                  </div>
                  <p className="mt-2 font-semibold">{invoice.client_name}</p>
                  <p className="text-sm text-gray-500">client@example.com</p>
                </div>
                <div className="text-right">
                  <h3 className="font-bold">INVOICE #{invoice.invoice_number}</h3>
                  <p className="text-sm text-gray-500">Issue Date: {invoice.issue_date}</p>
                  <p className="text-sm text-gray-500">Due Date: {invoice.due_date}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-sm uppercase text-gray-500 mb-2">Description</h4>
                <p>{invoice.description || "Services provided"}</p>
              </div>
              
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Item</span>
                  <div className="flex">
                    <span className="w-16 text-right">Qty</span>
                    <span className="w-20 text-right">Price</span>
                    <span className="w-24 text-right">Amount</span>
                  </div>
                </div>
                
                <div className="border-t border-b py-2">
                  <div className="flex justify-between my-2">
                    <span>Professional Services</span>
                    <div className="flex">
                      <span className="w-16 text-right">1</span>
                      <span className="w-20 text-right">${invoice.amount.toFixed(2)}</span>
                      <span className="w-24 text-right">${invoice.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold mr-8">Total:</span>
                      <span className="font-bold">${invoice.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-6">
                <span className="text-blue-500 text-sm font-medium">Pay online</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
