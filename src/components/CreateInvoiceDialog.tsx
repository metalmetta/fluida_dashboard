
import { useState, useEffect, useCallback } from "react";
import { format, addDays } from "date-fns";
import { CalendarIcon, Plus, MinusCircle, Check, User } from "lucide-react";
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
import { useContacts } from "@/hooks/useContacts";
import { Contact } from "@/types/contact";
import { AddContactDialog } from "@/components/AddContactDialog";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList 
} from "@/components/ui/command";

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
  const { contacts, isLoading: contactsLoading, addContact } = useContacts();
  const [customerContacts, setCustomerContacts] = useState<Contact[]>([]);
  const [commandOpen, setCommandOpen] = useState(false);
  const [contactSearchTerm, setContactSearchTerm] = useState("");
  const [addContactDialogOpen, setAddContactDialogOpen] = useState(false);

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

  useEffect(() => {
    if (open) {
      setForm(initialFormState);
      setContactSearchTerm("");
    }
  }, [open]);

  useEffect(() => {
    if (contacts.length > 0) {
      const filtered = contacts.filter(
        (contact) => contact.type.toLowerCase() === "customer"
      );
      setCustomerContacts(filtered);
    }
  }, [contacts]);

  const updateItem = useCallback((index: number, field: string, value: any) => {
    setForm(prevForm => {
      const updatedItems = [...prevForm.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };

      if (field === 'quantity' || field === 'price') {
        updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].price;
      }

      return {
        ...prevForm,
        items: updatedItems
      };
    });
  }, []);

  const addItem = useCallback(() => {
    setForm(prevForm => ({
      ...prevForm,
      items: [
        ...prevForm.items,
        {
          description: "",
          quantity: 1,
          price: 0,
          amount: 0
        }
      ]
    }));
  }, []);

  const removeItem = useCallback((index: number) => {
    setForm(prevForm => {
      if (prevForm.items.length > 1) {
        const updatedItems = [...prevForm.items];
        updatedItems.splice(index, 1);
        return {
          ...prevForm,
          items: updatedItems
        };
      }
      return prevForm;
    });
  }, []);

  const calculateTotal = useCallback(() => {
    return form.items.reduce((total, item) => total + item.amount, 0);
  }, [form.items]);

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

  const handleSelectContact = useCallback((contact: Contact) => {
    // Update form with all available contact data
    setForm(prevForm => ({
      ...prevForm,
      client_name: contact.name,
      client_email: contact.email || "",
      client_address: contact.address || "",
      client_city: contact.city || "",
      client_state: contact.state || "",
      client_zip: contact.zip || "",
      client_country: contact.country || "",
      client_tax_id: contact.tax_id || ""
    }));
    setCommandOpen(false);
  }, []);

  const handleNewContactAdded = useCallback(() => {
    // This will be called when a new contact is successfully added
    setAddContactDialogOpen(false);
  }, []);

  const filteredContacts = customerContacts.filter(
    contact => 
      contact.name.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
      (contact.company && contact.company.toLowerCase().includes(contactSearchTerm.toLowerCase())) ||
      (contact.email && contact.email.toLowerCase().includes(contactSearchTerm.toLowerCase()))
  );

  return (
    <>
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
                    <div className="relative">
                      <Popover open={commandOpen} onOpenChange={setCommandOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={commandOpen}
                            className="w-full justify-between"
                          >
                            {form.client_name ? (
                              form.client_name
                            ) : (
                              <span className="flex items-center text-muted-foreground">
                                <User className="mr-2 h-4 w-4" />
                                Select a customer...
                              </span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="start" side="bottom" style={{ width: "300px" }}>
                          <Command>
                            <CommandInput 
                              placeholder="Search customers..." 
                              value={contactSearchTerm}
                              onValueChange={setContactSearchTerm}
                            />
                            <CommandList>
                              <CommandEmpty>
                                No customers found.
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full mt-2"
                                  onClick={() => {
                                    setAddContactDialogOpen(true);
                                    setCommandOpen(false);
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add new customer
                                </Button>
                              </CommandEmpty>
                              <CommandGroup>
                                {filteredContacts.map((contact) => (
                                  <CommandItem
                                    key={contact.id}
                                    onSelect={() => handleSelectContact(contact)}
                                    className="flex items-center"
                                  >
                                    {contact.name}
                                    {contact.company && (
                                      <span className="ml-2 text-muted-foreground text-xs">
                                        ({contact.company})
                                      </span>
                                    )}
                                    {form.client_name === contact.name && (
                                      <Check className="ml-auto h-4 w-4" />
                                    )}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                              <CommandGroup>
                                <CommandItem
                                  onSelect={() => {
                                    setAddContactDialogOpen(true);
                                    setCommandOpen(false);
                                  }}
                                  className="flex items-center text-primary"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add new customer
                                </CommandItem>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
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
                      onChange={(e) => setForm(prevForm => ({ ...prevForm, client_email: e.target.value }))}
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
                  onChange={(e) => setForm(prevForm => ({ ...prevForm, client_address: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_city">City</Label>
                  <Input
                    id="client_city"
                    placeholder="Enter city..."
                    value={form.client_city || ""}
                    onChange={(e) => setForm(prevForm => ({ ...prevForm, client_city: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="client_state">State</Label>
                  <Input
                    id="client_state"
                    placeholder="Enter state..."
                    value={form.client_state || ""}
                    onChange={(e) => setForm(prevForm => ({ ...prevForm, client_state: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client_zip">Zip Code</Label>
                <Input
                  id="client_zip"
                  placeholder="Enter ZIP..."
                  value={form.client_zip || ""}
                  onChange={(e) => setForm(prevForm => ({ ...prevForm, client_zip: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client_country">Country</Label>
                <Input
                  id="client_country"
                  placeholder="Enter country..."
                  value={form.client_country || ""}
                  onChange={(e) => setForm(prevForm => ({ ...prevForm, client_country: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client_tax_id">Tax ID</Label>
                <Input
                  id="client_tax_id"
                  placeholder="Enter tax ID..."
                  value={form.client_tax_id || ""}
                  onChange={(e) => setForm(prevForm => ({ ...prevForm, client_tax_id: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice_number">Invoice Number</Label>
                  <Input
                    id="invoice_number"
                    value={form.invoice_number}
                    onChange={(e) => setForm(prevForm => ({ ...prevForm, invoice_number: e.target.value }))}
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
                        onSelect={(date) => setForm(prevForm => ({ ...prevForm, issue_date: format(date || new Date(), "yyyy-MM-dd") }))}
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
                        onSelect={(date) => setForm(prevForm => ({ ...prevForm, due_date: format(date || new Date(), "yyyy-MM-dd") }))}
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
                  onChange={(e) => setForm(prevForm => ({ ...prevForm, notes: e.target.value }))}
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

          {/* Invoice preview section */}
          <div className="md:w-2/5 bg-gray-50 p-6 border-l overflow-y-auto hidden md:block">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between mb-8">
                <div>
                  <h3 className="font-bold text-xl">{companyName}</h3>
                  <p className="text-sm text-gray-500">{companyEmail}</p>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-lg">INVOICE</h3>
                  <p className="text-sm text-gray-500">#{form.invoice_number}</p>
                </div>
              </div>
              
              <div className="mb-8">
                <h4 className="font-medium text-gray-500 text-sm mb-2">BILL TO</h4>
                {form.client_name ? (
                  <>
                    <p className="font-medium">{form.client_name}</p>
                    {form.client_email && <p className="text-sm">{form.client_email}</p>}
                    {form.client_address && <p className="text-sm">{form.client_address}</p>}
                    <p className="text-sm">
                      {form.client_city && `${form.client_city}, `}
                      {form.client_state && `${form.client_state} `}
                      {form.client_zip && form.client_zip}
                    </p>
                    {form.client_country && <p className="text-sm">{form.client_country}</p>}
                  </>
                ) : (
                  <p className="text-gray-400 italic">No client selected</p>
                )}
              </div>
              
              <div className="flex justify-between mb-4 text-sm">
                <div>
                  <p className="text-gray-500">Issue Date</p>
                  <p>{form.issue_date}</p>
                </div>
                <div>
                  <p className="text-gray-500">Due Date</p>
                  <p>{form.due_date}</p>
                </div>
              </div>
              
              <div className="border-t border-b py-4 my-4">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span className="w-5/12">Description</span>
                  <span className="w-2/12 text-center">Qty</span>
                  <span className="w-2/12 text-right">Price</span>
                  <span className="w-3/12 text-right">Amount</span>
                </div>
                
                {form.items.map((item, index) => (
                  <div key={index} className="flex justify-between my-2 text-sm">
                    <span className="w-5/12 truncate">{item.description || "Item description"}</span>
                    <span className="w-2/12 text-center">{item.quantity}</span>
                    <span className="w-2/12 text-right">${item.price.toFixed(2)}</span>
                    <span className="w-3/12 text-right">${item.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end">
                <div className="w-1/2">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {form.notes && (
                <div className="mt-8 pt-4 border-t text-sm">
                  <h4 className="font-medium text-gray-500 mb-2">NOTES</h4>
                  <p>{form.notes}</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddContactDialog
        open={addContactDialogOpen}
        onOpenChange={setAddContactDialogOpen}
        defaultContactType="Customer"
        onSuccess={handleNewContactAdded}
      />
    </>
  );
}
