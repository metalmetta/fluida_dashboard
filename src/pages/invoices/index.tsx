import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Upload, Loader2, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import quickbooksIcon from "../vendors/quickbooks.png";

interface Invoice {
  id: string;
  vendor: string;
  amount: string;
  date: string;
  status: "paid" | "pending" | "overdue";
  invoiceNumber?: string;
  description?: string;
  dueDate?: string;
  synced?: boolean;
}

const initialInvoices = [
  {
    id: "INV-001",
    vendor: "Acme Corp",
    amount: "$3,450.00",
    date: "Feb 20, 2024",
    status: "paid",
    synced: true
  },
  {
    id: "INV-002",
    vendor: "Tech Solutions",
    amount: "$1,890.00",
    date: "Feb 18, 2024",
    status: "pending",
    synced: true
  },
  {
    id: "INV-003",
    vendor: "Global Services",
    amount: "$2,750.00",
    date: "Feb 15, 2024",
    status: "overdue",
    synced: false
  },
] as Invoice[];

const getBadgeVariant = (status: Invoice['status']) => {
  switch (status) {
    case 'paid':
      return 'success';
    case 'pending':
      return 'secondary';
    case 'overdue':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Mock function to simulate PDF data extraction
  const extractPdfData = async (file: File): Promise<Partial<Invoice>> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock extracted data
    return {
      vendor: "New Vendor Corp",
      amount: "$1,234.56",
      invoiceNumber: "INV-2024-001",
      description: "Professional Services",
      date: new Date().toLocaleDateString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is PDF
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    setIsUploading(true);
    try {
      // Extract data from PDF
      const extractedData = await extractPdfData(file);
      
      // Create new invoice
      const newInvoice: Invoice = {
        id: `INV-${invoices.length + 1}`.padStart(7, "0"),
        vendor: extractedData.vendor || "Unknown Vendor",
        amount: extractedData.amount || "$0.00",
        date: extractedData.date || new Date().toLocaleDateString(),
        status: "pending",
        invoiceNumber: extractedData.invoiceNumber,
        description: extractedData.description,
        dueDate: extractedData.dueDate,
      };

      setInvoices([newInvoice, ...invoices]);
      setIsDialogOpen(false);
      toast.success("Invoice uploaded successfully");
    } catch (error) {
      toast.error("Error processing invoice");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePayInvoice = async (invoice: Invoice) => {
    setIsProcessingPayment(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update invoice status
      setInvoices(invoices.map(inv => 
        inv.id === invoice.id ? { ...inv, status: "paid" } : inv
      ));
      
      setSelectedInvoice(null);
      toast.success("Payment processed successfully");
    } catch (error) {
      toast.error("Error processing payment");
      console.error(error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Invoices</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Invoice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Invoice</DialogTitle>
                <DialogDescription>
                  Upload a PDF invoice to automatically extract and process the data.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="invoice-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {isUploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mb-2 text-primary" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">PDF files only</p>
                        </>
                      )}
                    </div>
                    <input
                      id="invoice-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <div className="p-6 space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="pl-9"
              />
            </div>

            <div className="divide-y">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{invoice.vendor}</p>
                        {invoice.synced && (
                          <img
                            src={quickbooksIcon}
                            alt="QuickBooks Synced"
                            className="w-4 h-4 object-contain opacity-80 inline-block align-middle"
                            title="Synced with QuickBooks"
                          />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {invoice.id} • {invoice.date}
                      </p>
                      {invoice.description && (
                        <p className="text-sm text-muted-foreground">
                          {invoice.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">{invoice.amount}</p>
                      {invoice.dueDate && (
                        <p className="text-sm text-muted-foreground">
                          Due: {invoice.dueDate}
                        </p>
                      )}
                    </div>
                    <Badge 
                      variant={getBadgeVariant(invoice.status)}
                      className={cn(
                        invoice.status === 'pending' && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80",
                        invoice.status === 'paid' && "bg-green-100 text-green-800 hover:bg-green-100/80",
                        invoice.status === 'overdue' && "bg-red-100 text-red-800 hover:bg-red-100/80"
                      )}
                    >
                      {invoice.status}
                    </Badge>
                    {invoice.status !== "paid" && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedInvoice(invoice)}
                          >
                            Review & Pay
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Review & Pay Invoice</DialogTitle>
                            <DialogDescription>
                              Review the invoice details and confirm payment.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <h4 className="font-medium">Invoice Details</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <p className="text-muted-foreground">Invoice Number:</p>
                                <p>{invoice.invoiceNumber || invoice.id}</p>
                                <p className="text-muted-foreground">Vendor:</p>
                                <p>{invoice.vendor}</p>
                                <p className="text-muted-foreground">Amount:</p>
                                <p className="font-medium">{invoice.amount}</p>
                                <p className="text-muted-foreground">Date:</p>
                                <p>{invoice.date}</p>
                                {invoice.dueDate && (
                                  <>
                                    <p className="text-muted-foreground">Due Date:</p>
                                    <p>{invoice.dueDate}</p>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-2">
                              <h4 className="font-medium">Payment Summary</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <p className="text-muted-foreground">Invoice Amount:</p>
                                <p className="font-medium">{invoice.amount}</p>
                                <p className="text-muted-foreground">Processing Fee:</p>
                                <p>$0.00</p>
                                <p className="text-muted-foreground font-medium">Total:</p>
                                <p className="font-medium">{invoice.amount}</p>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={() => handlePayInvoice(invoice)}
                              disabled={isProcessingPayment}
                            >
                              {isProcessingPayment ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Confirm Payment
                                </>
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
