import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Upload, Loader2, CreditCard, Mail, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import quickbooksIcon from "../vendors/quickbooks.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface Invoice {
  id: string;
  vendor: string;
  amount: string;
  date: string;
  status: "paid" | "pending" | "overdue";
  billNumber?: string;
  description?: string;
  dueDate?: string;
  synced?: boolean;
}

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

// Mock data for invoice extraction
const mockVendors = [
  "Tesla Inc",
  "Microsoft Corporation",
  "Amazon Web Services",
  "Google Cloud",
  "Apple Inc",
  "Adobe Systems",
  "Salesforce",
  "Oracle Corporation",
  "IBM Services",
  "Dell Technologies",
  "Stripe Payments",
  "Slack Technologies",
  "Zoom Video Communications",
  "Dropbox Inc",
  "GitHub Inc"
];

const mockDescriptions = [
  "Software subscription",
  "Consulting services",
  "Cloud infrastructure",
  "Hardware purchase",
  "Professional services",
  "Monthly maintenance",
  "Training services",
  "Office equipment",
  "Marketing services",
  "Legal services",
  "Design services",
  "Support contract",
  "Annual membership"
];

const columns = [
  {
    accessorKey: "dueDate",
    header: "Due date",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      return (
        <Badge 
          variant={getBadgeVariant(status)}
          className={cn(
            "rounded-full",
            status === 'pending' && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80",
            status === 'paid' && "bg-green-100 text-green-800 hover:bg-green-100/80",
            status === 'overdue' && "bg-red-100 text-red-800 hover:bg-red-100/80"
          )}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "vendor",
    header: "Recipient",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      return <div className="text-right font-medium">{row.getValue("amount")}</div>;
    },
  },
  {
    accessorKey: "billNumber",
    header: "Bill no.",
  },
  {
    accessorKey: "date",
    header: "Added on",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const invoice = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(invoice.billNumber)}
            >
              Copy bill number
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Download PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const uploadFormSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.type === "application/pdf", {
      message: "Please upload a PDF file"
    })
    .refine((file) => file.size <= 5000000, {
      message: "File size must be less than 5MB"
    })
});

export default function Bills() {
  const { session } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [activeTab, setActiveTab] = useState("inbox");
  const [activeFilter, setActiveFilter] = useState("all");
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof uploadFormSchema>>({
    resolver: zodResolver(uploadFormSchema),
  });

  // Use React Query to fetch invoices from Supabase
  const { data: bills = [], refetch } = useQuery({
    queryKey: ['bills'],
    queryFn: async () => {
      if (!session?.user?.id) return []; // Return an empty array if no user session
      
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bills:', error);
        toast.error('Failed to load bills');
        return []; // Return an empty array on error
      }

      // Transform the data to match our Invoice interface
      return data.map(bill => ({
        id: bill.id,
        vendor: bill.vendor,
        amount: `$${bill.amount.toFixed(2)}`,
        date: new Date(bill.created_at).toLocaleDateString(),
        status: bill.status,
        billNumber: bill.bill_number,
        description: bill.description,
        dueDate: bill.due_date ? new Date(bill.due_date).toLocaleDateString() : undefined,
        synced: false
      }));
    },
    enabled: !!session?.user?.id
  });

  // Function to generate random mock data for PDF extraction
  const extractPdfData = async (file: File): Promise<Partial<Invoice>> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate random invoice data
    const randomVendor = mockVendors[Math.floor(Math.random() * mockVendors.length)];
    const randomDescription = mockDescriptions[Math.floor(Math.random() * mockDescriptions.length)];
    
    // Generate random amount between $100 and $10,000
    const randomAmount = (Math.floor(Math.random() * 9900) + 100) / 100;
    const formattedAmount = `$${randomAmount.toFixed(2)}`;
    
    // Generate random invoice number
    const year = new Date().getFullYear();
    const randomNumber = Math.floor(10000 + Math.random() * 90000);
    const billNumber = `INV-${year}-${randomNumber}`;
    
    // Generate random date within the last 30 days
    const randomDaysAgo = Math.floor(Math.random() * 30);
    const invoiceDate = new Date();
    invoiceDate.setDate(invoiceDate.getDate() - randomDaysAgo);
    
    // Due date is typically 30 days after invoice date
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 30);
    
    // Extract file name without extension as potential reference number
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    
    console.log(`Extracted data from ${fileName}: ${randomVendor}, ${formattedAmount}`);
    
    return {
      vendor: randomVendor,
      amount: formattedAmount,
      billNumber: billNumber,
      description: randomDescription,
      date: invoiceDate.toLocaleDateString(),
      dueDate: dueDate.toLocaleDateString(),
    };
  };

  const handleFormSubmit = async (data: z.infer<typeof uploadFormSchema>) => {
    const file = data.file;
    if (!file) return;

    if (!session?.user?.id) {
      toast.error("You must be logged in to upload bills");
      return;
    }

    setIsUploading(true);
    try {
      // Extract data from PDF
      const extractedData = await extractPdfData(file);
      
      // Parse amount to remove $ sign and convert to number
      const amountString = extractedData.amount || "$0.00";
      const amountNumber = parseFloat(amountString.replace(/[^0-9.-]+/g, ""));

      // Parse dates properly
      const parseDateString = (dateStr: string | undefined): string => {
        if (!dateStr) return new Date().toISOString();
        
        // Split the date string into components
        const [month, day, year] = dateStr.split('/').map(num => parseInt(num));
        
        // Create a new Date object (month is 0-based in JavaScript)
        const date = new Date(year, month - 1, day);
        
        // Return ISO string
        return date.toISOString();
      };

      // Convert dates to ISO format
      const invoiceDate = parseDateString(extractedData.date);
      const dueDate = parseDateString(extractedData.dueDate);

      // Insert bill to Supabase
      const { data: billData, error } = await supabase
        .from('bills')
        .insert([
          {
            user_id: session.user.id,
            amount: amountNumber,
            date: invoiceDate,
            due_date: dueDate,
            bill_number: extractedData.billNumber,
            description: extractedData.description,
            status: 'pending'
          }
        ])
        .select();

      if (error) {
        console.error('Error saving bill:', error);
        throw error;
      }

      // Create new bill object for UI
      const newBill: Invoice = {
        id: billData[0].id,
        vendor: extractedData.vendor || "Unknown Vendor",
        amount: extractedData.amount || "$0.00",
        date: extractedData.date || new Date().toLocaleDateString(),
        status: "pending",
        billNumber: extractedData.billNumber,
        description: extractedData.description,
        dueDate: extractedData.dueDate,
      };

      setIsDialogOpen(false);
      toast.success("Bill uploaded successfully");
      refetch(); // Refresh the bills list
    } catch (error) {
      toast.error("Error processing bill");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePayInvoice = async (bill: Invoice) => {
    setIsProcessingPayment(true);
    try {
      // Find the bill in Supabase by bill_number or id
      if (bill.billNumber) {
        const { error: billError } = await supabase
          .from('bills')
          .update({ status: 'paid' })
          .eq('bill_number', bill.billNumber);
          
        if (billError) throw billError;

        // Get the bill ID
        const { data: billData } = await supabase
          .from('bills')
          .select('id')
          .eq('bill_number', bill.billNumber)
          .single();

        if (!billData?.id) {
          throw new Error('Bill not found');
        }

        // Create a transaction record for the bill payment
        const { error: actionError } = await supabase
          .from('actions')
          .insert([{
            type: 'Bill Payment',
            amount: parseFloat(bill.amount.replace(/[^0-9.-]+/g, "")),
            status: 'completed',
            approvals_required: 2,
            approvals_received: 2, // Auto-approve bill payments
            user_id: session?.user?.id,
            bill_id: billData.id
          }]);

        if (actionError) throw actionError;
      }
      
      // Update bill status in local state
      refetch();
      
      setSelectedInvoice(null);
      toast.success("Payment processed successfully");
    } catch (error) {
      toast.error("Error processing payment");
      console.error(error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Calculate summary statistics
  const summaryStats = {
    totalOutstanding: {
      count: bills?.filter(i => i.status !== 'paid').length || 0,
      amount: bills?.reduce((sum, i) => sum + (i.status !== 'paid' ? parseFloat(i.amount.replace(/[^0-9.-]+/g, "")) : 0), 0) || 0
    },
    overdue: {
      count: 0,
      amount: 0
    },
    dueNext7Days: {
      count: 0,
      amount: 0
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Bill Pay</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Bill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Bill</DialogTitle>
                <DialogDescription>
                  Upload a PDF bill to automatically extract and process the data.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormControl>
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
                                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF files only (max 5MB)</p>
                                  </>
                                )}
                              </div>
                              <input
                                id="invoice-upload"
                                type="file"
                                className="hidden"
                                accept=".pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    onChange(file);
                                  }
                                }}
                                disabled={isUploading}
                                {...field}
                              />
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-4xl font-semibold">{summaryStats.totalOutstanding.count}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Total outstanding</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">${summaryStats.totalOutstanding.amount.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-4xl font-semibold text-destructive">{summaryStats.overdue.count}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Overdue</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-destructive">${summaryStats.overdue.amount.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-4xl font-semibold text-warning">{summaryStats.dueNext7Days.count}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Due in next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-warning">${summaryStats.dueNext7Days.amount.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Filters */}
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-2">
              <TabsTrigger 
                value="inbox"
                className={cn(
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  "relative px-3 py-1.5 text-sm font-medium",
                  "rounded-full border bg-background"
                )}
              >
                Inbox
                <Badge variant="secondary" className="ml-2 bg-background/50">3</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="needs-approval"
                className={cn(
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  "relative px-3 py-1.5 text-sm font-medium",
                  "rounded-full border bg-background"
                )}
              >
                Needs Approval
                <Badge variant="secondary" className="ml-2 bg-background/50">1</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="scheduled"
                className={cn(
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  "relative px-3 py-1.5 text-sm font-medium",
                  "rounded-full border bg-background"
                )}
              >
                Scheduled
                <Badge variant="secondary" className="ml-2 bg-background/50">2</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="paid"
                className={cn(
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  "relative px-3 py-1.5 text-sm font-medium",
                  "rounded-full border bg-background"
                )}
              >
                Paid
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            {["All", "Overdue", "Due next 7", "Not due yet", "Missing due date"].map((filter) => (
              <Button
                key={filter}
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-full",
                  activeFilter === filter.toLowerCase() && "bg-primary text-primary-foreground"
                )}
                onClick={() => setActiveFilter(filter.toLowerCase())}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        {/* Invoice Table */}
        <Card>
          <div className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Due date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Bill no.</TableHead>
                  <TableHead>Added on</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow key={bill.id} className="group">
                    <TableCell>{bill.dueDate || '-'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={getBadgeVariant(bill.status)}
                        className={cn(
                          "rounded-full",
                          bill.status === 'pending' && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80",
                          bill.status === 'paid' && "bg-green-100 text-green-800 hover:bg-green-100/80",
                          bill.status === 'overdue' && "bg-red-100 text-red-800 hover:bg-red-100/80"
                        )}
                      >
                        {bill.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{bill.vendor}</TableCell>
                    <TableCell>{bill.amount}</TableCell>
                    <TableCell>{bill.billNumber}</TableCell>
                    <TableCell>{bill.date}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(bill.billNumber)}
                          >
                            Copy bill number
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>View details</DropdownMenuItem>
                          <DropdownMenuItem>Download PDF</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
