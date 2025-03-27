import { useState, useEffect, useCallback } from "react";
import { format, addDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InvoiceFormData, InvoiceFormStep } from "@/types/invoice";
import { useContacts } from "@/hooks/useContacts";
import { Contact } from "@/types/contact";
import { AddContactDialog } from "@/components/AddContactDialog";
import { generateInvoiceId } from "@/lib/billUtils";

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
  const { contacts, isLoading: contactsLoading, addContact, fetchContacts } = useContacts();
  const [customerContacts, setCustomerContacts] = useState<Contact[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [contactSearchTerm, setContactSearchTerm] = useState("");
  const [currentStep, setCurrentStep] = useState<InvoiceFormStep>("customer");
  const [addContactDialogOpen, setAddContactDialogOpen] = useState(false);

  const getNextInvoiceNumber = () => {
    const date = new Date();
    const defaultInvoiceNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return generateInvoiceId(date, "Customer", defaultInvoiceNumber);
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
    notes: "",
    payment_method: "",
    payment_instructions: "",
    terms: ""
  };

  const [form, setForm] = useState<InvoiceFormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initialFormState);
      setContactSearchTerm("");
      setCurrentStep("customer");
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

  useEffect(() => {
    if (form.client_name && form.client_name !== "Customer") {
      const currentNumber = form.invoice_number.split('-').pop() || '001';
      const updatedInvoiceId = generateInvoiceId(
        new Date(form.issue_date),
        form.client_name,
        currentNumber
      );
      setForm(prev => ({
        ...prev,
        invoice_number: updatedInvoiceId
      }));
    }
  }, [form.client_name, form.issue_date]);

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
    if (form.items.length > 1) {
      setForm(prevForm => {
        const updatedItems = [...prevForm.items];
        updatedItems.splice(index, 1);
        return {
          ...prevForm,
          items: updatedItems
        };
      });
    }
  }, [form.items.length]);

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
    setDropdownOpen(false);
  }, []);

  const handleAddContactSuccess = useCallback((newContact: Contact) => {
    fetchContacts();
    handleSelectContact(newContact);
    setAddContactDialogOpen(false);
    toast({
      title: "Success",
      description: "New contact added successfully"
    });
  }, [fetchContacts, handleSelectContact, toast]);

  const nextStep = () => {
    switch (currentStep) {
      case "customer":
        setCurrentStep("items");
        break;
      case "items":
        setCurrentStep("payment");
        break;
      default:
        break;
    }
  };

  const previousStep = () => {
    switch (currentStep) {
      case "items":
        setCurrentStep("customer");
        break;
      case "payment":
        setCurrentStep("items");
        break;
      default:
        break;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "customer":
        return (
          <CustomerDetailsStep
            form={form}
            setForm={setForm}
            customerContacts={customerContacts}
            contactSearchTerm={contactSearchTerm}
            setContactSearchTerm={setContactSearchTerm}
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
            handleSelectContact={handleSelectContact}
            openAddContactDialog={() => setAddContactDialogOpen(true)}
            onNext={nextStep}
          />
        );
      case "items":
        return (
          <LineItemsStep
            form={form}
            setForm={setForm}
            updateItem={updateItem}
            addItem={addItem}
            removeItem={removeItem}
            onPrevious={previousStep}
            onNext={nextStep}
          />
        );
      case "payment":
        return (
          <PaymentDetailsStep
            form={form}
            setForm={setForm}
            onPrevious={previousStep}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: "customer", label: "Customer" },
      { key: "items", label: "Line Items" },
      { key: "payment", label: "Payment" }
    ];

    return (
      <div className="flex justify-between mb-8 border-b pb-4">
        {steps.map((step, index) => (
          <div key={step.key} className="flex flex-col items-center">
            <div 
              className={`rounded-full w-8 h-8 flex items-center justify-center mb-1 
                ${currentStep === step.key 
                  ? "bg-primary text-white" 
                  : index < steps.findIndex(s => s.key === currentStep) 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-400"}`}
            >
              {index + 1}
            </div>
            <span 
              className={`text-xs font-medium ${currentStep === step.key 
                ? "text-primary" 
                : index < steps.findIndex(s => s.key === currentStep) 
                  ? "text-green-800" 
                  : "text-gray-400"}`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] p-0 gap-0 max-h-[90vh] overflow-hidden flex">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create invoice</DialogTitle>
          </DialogHeader>
          
          {renderStepIndicator()}
          {renderStepContent()}
        </div>

        <div className="md:w-2/5 bg-gray-50 p-6 border-l overflow-y-auto hidden md:block">
          <InvoicePreview 
            form={form}
            companyName={companyName}
            companyEmail={companyEmail}
            calculateTotal={calculateTotal}
          />
        </div>
      </DialogContent>

      <AddContactDialog 
        open={addContactDialogOpen}
        onOpenChange={setAddContactDialogOpen}
        defaultType="Customer"
        onSuccess={handleAddContactSuccess}
      />
    </Dialog>
  );
}
