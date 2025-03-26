import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, UploadIcon, X, DollarSign, PlusCircle } from "lucide-react";
import { format } from "date-fns";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { BillFormData } from "@/types/bill";
import { useToast } from "@/hooks/use-toast";
import { useContacts } from "@/hooks/useContacts";
import { AddContactDialog } from "@/components/AddContactDialog";

const formSchema = z.object({
  vendor: z.string().min(1, "Vendor is required"),
  amount: z.string().min(1, "Amount is required").transform(val => parseFloat(val)),
  bill_number: z.string().min(1, "Bill number is required"),
  category: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["Draft", "Ready for payment", "Paid", "Approve"]).default("Draft"),
  issue_date: z.date({
    required_error: "Issue date is required",
  }),
  due_date: z.date({
    required_error: "Due date is required",
  }),
});

type AddBillDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BillFormData) => Promise<void>;
};

export function AddBillDialog({ open, onOpenChange, onSubmit }: AddBillDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { contacts, isLoading: isLoadingContacts } = useContacts();
  const [addContactDialogOpen, setAddContactDialogOpen] = useState(false);
  
  const vendorContacts = contacts.filter(contact => contact.type === 'Vendor');
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vendor: "",
      amount: undefined,
      bill_number: "",
      category: "",
      description: "",
      status: "Draft",
      issue_date: new Date(),
      due_date: new Date(new Date().setDate(new Date().getDate() + 30)),
    },
  });

  const handleSubmit = useCallback(async (values: z.infer<typeof formSchema>, status: "Draft" | "Ready for payment") => {
    setIsSubmitting(true);
    try {
      const formattedData: BillFormData = {
        vendor: values.vendor,
        amount: values.amount,
        bill_number: values.bill_number,
        status: status,
        issue_date: values.issue_date.toISOString().split('T')[0],
        due_date: values.due_date.toISOString().split('T')[0],
        category: values.category,
        description: values.description
      };
      
      await onSubmit(formattedData);
      form.reset();
      onOpenChange(false);
      toast({
        title: "Success",
        description: `Bill has been ${status === "Draft" ? "saved as draft" : "marked as ready for payment"}`,
      });
    } catch (error) {
      console.error("Error submitting bill:", error);
      toast({
        title: "Error",
        description: "Failed to add bill. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, onSubmit, onOpenChange, toast]);

  const handleContactAdded = useCallback(() => {
    setAddContactDialogOpen(false);
  }, []);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>New bill</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="flex flex-col md:flex-row">
                {/* Left Column - Drag and Drop */}
                <div className="md:w-1/3 px-6">
                  <div className="bg-gray-50 h-full py-16 px-6 rounded-lg flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <UploadIcon className="h-6 w-6 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        Drop invoice or <span className="text-blue-500 hover:underline">browse files</span>
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Form Fields */}
                <div className="md:w-2/3 px-6 space-y-5 overflow-y-auto max-h-[70vh]">
                  <h2 className="text-lg font-medium">Summary</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FormField
                        control={form.control}
                        name="vendor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-muted-foreground">Contact</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Select 
                                  value={field.value} 
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a vendor" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {isLoadingContacts ? (
                                      <div className="p-2 text-center text-sm">Loading vendors...</div>
                                    ) : vendorContacts.length === 0 ? (
                                      <div className="p-2 text-center text-sm">No vendors found</div>
                                    ) : (
                                      vendorContacts.map((contact) => (
                                        <SelectItem key={contact.id} value={contact.name}>
                                          {contact.name} {contact.company ? `(${contact.company})` : ''}
                                        </SelectItem>
                                      ))
                                    )}
                                    <div className="border-t mx-2 my-1" />
                                    <div
                                      className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                      onClick={() => setAddContactDialogOpen(true)}
                                    >
                                      <PlusCircle className="mr-2 h-4 w-4" />
                                      <span>Add new vendor</span>
                                    </div>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div>
                      <FormField
                        control={form.control}
                        name="bill_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-muted-foreground">Invoice #</FormLabel>
                            <FormControl>
                              <Input placeholder="Add number..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FormField
                        control={form.control}
                        name="issue_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-sm text-muted-foreground">Invoice date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal flex justify-start",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? (
                                      format(field.value, "MMM dd, yyyy")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                  className="pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div>
                      <FormField
                        control={form.control}
                        name="due_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-sm text-muted-foreground">Due date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal flex justify-start",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? (
                                      format(field.value, "MMM dd, yyyy")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                  className="pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-muted-foreground">Amount</FormLabel>
                          <div className="flex">
                            <FormControl>
                              <div className="relative flex-1">
                                <span className="absolute left-3 top-2.5">$</span>
                                <Input 
                                  type="number" 
                                  step="0.01" 
                                  placeholder="0.00" 
                                  className="pl-7"
                                  {...field}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    field.onChange(val);
                                  }}
                                />
                              </div>
                            </FormControl>
                            <Select defaultValue="USD">
                              <SelectTrigger className="w-28 ml-2">
                                <SelectValue placeholder="USD" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                                <SelectItem value="GBP">GBP</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <h2 className="text-lg font-medium pt-2">Invoice details</h2>
                  
                  <div>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-muted-foreground">Memo</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Add memo..." 
                              className="resize-none h-20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <h2 className="text-lg font-medium pt-2">Payment details</h2>
                  
                  <div>
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-muted-foreground">Asset</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an asset" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Checking">Checking Account</SelectItem>
                              <SelectItem value="Savings">Savings Account</SelectItem>
                              <SelectItem value="CreditCard">Credit Card</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end items-center p-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="mr-2" 
                  onClick={() => {
                    const values = form.getValues();
                    form.handleSubmit((data) => handleSubmit(data, "Draft"))();
                  }}
                  disabled={isSubmitting}
                >
                  Save draft
                </Button>
                <Button 
                  type="button" 
                  onClick={() => {
                    const values = form.getValues();
                    form.handleSubmit((data) => handleSubmit(data, "Ready for payment"))();
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Ready for payment"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AddContactDialog 
        open={addContactDialogOpen} 
        onOpenChange={setAddContactDialogOpen}
        defaultType="Vendor"
        onSuccess={handleContactAdded}
      />
    </>
  );
}
