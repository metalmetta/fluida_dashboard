
import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { CalendarIcon, Plus, MinusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InvoiceFormData } from "@/types/invoice";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceCreated: () => void;
  companyName: string;
  companyEmail: string;
}

export function CreateInvoiceDialog({ 
  open, 
  onOpenChange, 
  onInvoiceCreated,
  companyName,
  companyEmail
}: CreateInvoiceDialogProps) {
  const { toast } = useToast();

  const getNextInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `INV-${year}${month}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  };

  const initialFormState: InvoiceFormData = {
    client_name: "",
    client_email: "",
    client_address: "",
    client_city: "",
    client_state: "",
    client_zip: "",
    client_country: "",
    client_tax_id: "",
    invoice_number: getNextInvoiceNumber(),
    issue_date: format(new Date(), "yyyy-MM-dd"),
    due_date: format(addDays(new Date(), 30), "yyyy-MM-dd"),
    items: [
      {
        description: "",
        quantity: 1,
        price: 0,
        amount: 0
      }
    ],
    notes: ""
  };

  const [form, setForm] = useState<InvoiceFormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setForm(initialFormState);
    }
  }, [open]);

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...form.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // Update amount automatically when quantity or price changes
    if (field === 'quantity' || field === 'price') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].price;
    }

    setForm({
      ...form,
      items: updatedItems
    });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        {
          description: "",
          quantity: 1,
          price: 0,
          amount: 0
        }
      ]
    });
  };

  const removeItem = (index: number) => {
    if (form.items.length > 1) {
      const updatedItems = [...form.items];
      updatedItems.splice(index, 1);
      setForm({
        ...form,
        items: updatedItems
      });
    }
  };

  const calculateTotal = () => {
    return form.items.reduce((total, item) => total + item.amount, 0);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        toast({
          title: "Error",
          description: "You must be logged in to create an invoice",
          variant: "destructive"
        });
        return;
      }
      
      const total = calculateTotal();
      
      const { error } = await supabase.from("invoices").insert({
        user_id: userData.user.id,
        invoice_number: form.invoice_number,
        client_name: form.client_name,
        amount: total,
        status: "draft",
        description: form.notes || `Invoice for ${form.client_name}`,
        issue_date: form.issue_date,
        due_date: form.due_date,
        payment_method: form.payment_method || null
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Invoice created successfully"
      });
      
      onInvoiceCreated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] p-0 gap-0 max-h-[90vh] overflow-hidden flex">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create invoice</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Customer</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_name">Name</Label>
                  <Input
                    id="client_name"
                    placeholder="Search or add"
                    value={form.client_name}
                    onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                  />
                  {!form.client_name && (
                    <p className="text-sm text-red-500">Select a customer</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_email">Email</Label>
                  <Input
                    id="client_email"
                    placeholder="client@example.com"
                    value={form.client_email}
                    onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                  />
                  {!form.client_email && (
                    <p className="text-sm text-red-500">Enter an email</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client_address">Address</Label>
              <Input
                id="client_address"
                placeholder="Enter address..."
                value={form.client_address || ""}
                onChange={(e) => setForm({ ...form, client_address: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_city">City</Label>
                <Input
                  id="client_city"
                  placeholder="Enter city..."
                  value={form.client_city || ""}
                  onChange={(e) => setForm({ ...form, client_city: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client_state">State</Label>
                <Input
                  id="client_state"
                  placeholder="Enter state..."
                  value={form.client_state || ""}
                  onChange={(e) => setForm({ ...form, client_state: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client_zip">Zip Code</Label>
              <Input
                id="client_zip"
                placeholder="Enter ZIP..."
                value={form.client_zip || ""}
                onChange={(e) => setForm({ ...form, client_zip: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client_country">Country</Label>
              <Input
                id="client_country"
                placeholder="Enter country..."
                value={form.client_country || ""}
                onChange={(e) => setForm({ ...form, client_country: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client_tax_id">Tax ID</Label>
              <Input
                id="client_tax_id"
                placeholder="Enter tax ID..."
                value={form.client_tax_id || ""}
                onChange={(e) => setForm({ ...form, client_tax_id: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice_number">Invoice Number</Label>
                <Input
                  id="invoice_number"
                  value={form.invoice_number}
                  onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="issue_date">Issue Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.issue_date}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(form.issue_date)}
                      onSelect={(date) => setForm({ ...form, issue_date: format(date || new Date(), "yyyy-MM-dd") })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.due_date}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(form.due_date)}
                      onSelect={(date) => setForm({ ...form, due_date: format(date || new Date(), "yyyy-MM-dd") })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Line Items</h3>
                <Button type="button" onClick={addItem} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-4">
                {form.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-6">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) => updateItem(index, "price", Number(e.target.value))}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        readOnly
                        value={item.amount.toFixed(2)}
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        disabled={form.items.length <= 1}
                      >
                        <MinusCircle className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Add notes to invoice..."
                value={form.notes || ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <div className="space-x-2">
              <Button variant="outline">Save draft</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Invoice"}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Live Preview */}
        <div className="w-[500px] bg-gray-50 p-8 overflow-y-auto border-l">
          <div className="bg-white p-8 border rounded-md shadow-sm">
            <div className="flex justify-between mb-10">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">INVOICE</h1>
              </div>
              <div>
                <div className="text-right mb-4">
                  <div className="text-sm text-gray-500">INVOICE NO</div>
                  <div className="font-medium">{form.invoice_number}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-right">
                  <div>
                    <div className="text-sm text-gray-500">ISSUED</div>
                    <div className="font-medium">
                      {format(new Date(form.issue_date), "MM/dd/yy")}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">DUE DATE</div>
                    <div className="font-medium">
                      {format(new Date(form.due_date), "MM/dd/yy")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mb-10">
              <div>
                <div className="text-sm text-gray-500 mb-1">FROM</div>
                <div className="inline-block bg-gray-200 p-4 rounded-full mb-2">
                  {companyName.charAt(0).toUpperCase()}
                </div>
                <div className="font-medium">{companyName}</div>
                <div className="text-sm text-gray-500">{companyEmail}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">TO</div>
                <div className="border p-4 rounded-md min-h-[100px] min-w-[200px]">
                  {form.client_name && (
                    <>
                      <div className="font-medium">{form.client_name}</div>
                      <div className="text-sm text-gray-500">{form.client_email}</div>
                      {form.client_address && (
                        <div className="text-sm mt-2">
                          {form.client_address}<br />
                          {form.client_city && `${form.client_city}, `}
                          {form.client_state && `${form.client_state} `}
                          {form.client_zip && form.client_zip}<br />
                          {form.client_country && form.client_country}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <table className="w-full mb-10">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-2">DESCRIPTION</th>
                  <th className="pb-2 text-center">QTY</th>
                  <th className="pb-2 text-right">PRICE</th>
                  <th className="pb-2 text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-4">{item.description || "—"}</td>
                    <td className="py-4 text-center">{item.quantity}</td>
                    <td className="py-4 text-right">${item.price.toFixed(2)}</td>
                    <td className="py-4 text-right">${item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="flex justify-end">
              <div className="w-1/3">
                <div className="flex justify-between py-2">
                  <div className="text-gray-500">Subtotal</div>
                  <div>${calculateTotal().toFixed(2)}</div>
                </div>
                <div className="flex justify-between py-2 text-lg font-bold border-t">
                  <div>Total</div>
                  <div>${calculateTotal().toFixed(2)}</div>
                </div>
              </div>
            </div>
            
            {form.notes && (
              <div className="mt-8 text-sm text-gray-500">
                <div className="font-medium mb-1">Notes:</div>
                <div>{form.notes}</div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
