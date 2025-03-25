
import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Check, ChevronDown } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InvoiceFormData } from "@/types/invoice";
import { Contact } from "@/types/contact";

interface CustomerDetailsStepProps {
  form: InvoiceFormData;
  setForm: (form: InvoiceFormData) => void;
  customerContacts: Contact[];
  contactSearchTerm: string;
  setContactSearchTerm: (term: string) => void;
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
  handleSelectContact: (contact: Contact) => void;
  openAddContactDialog: () => void;
  onNext: () => void;
}

export function CustomerDetailsStep({
  form,
  setForm,
  customerContacts,
  contactSearchTerm,
  setContactSearchTerm,
  dropdownOpen,
  setDropdownOpen,
  handleSelectContact,
  openAddContactDialog,
  onNext
}: CustomerDetailsStepProps) {
  const filteredContacts = customerContacts.filter(
    contact => 
      contact.name.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
      (contact.company && contact.company.toLowerCase().includes(contactSearchTerm.toLowerCase())) ||
      (contact.email && contact.email.toLowerCase().includes(contactSearchTerm.toLowerCase()))
  );

  const isNextDisabled = !form.client_name || !form.client_email;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Customer</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="client_name">Contact</Label>
            <div className="relative">
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-white"
                  >
                    {form.client_name || "Select a customer..."}
                    <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-[300px] max-h-[300px] overflow-auto p-0"
                  align="start"
                >
                  <div className="p-2">
                    <Input
                      placeholder="Search customers..."
                      value={contactSearchTerm}
                      onChange={(e) => setContactSearchTerm(e.target.value)}
                      className="mb-2"
                    />
                  </div>
                  
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <DropdownMenuItem
                        key={contact.id}
                        onSelect={() => handleSelectContact(contact)}
                        className="cursor-pointer p-2"
                      >
                        <div className="flex items-center w-full">
                          <span className="flex-1">
                            {contact.name}
                            {contact.company && (
                              <span className="ml-2 text-muted-foreground text-xs">
                                ({contact.company})
                              </span>
                            )}
                          </span>
                          {form.client_name === contact.name && (
                            <Check className="h-4 w-4 ml-2" />
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-2 text-center text-sm text-gray-500">
                      No customers found.
                    </div>
                  )}
                  
                  <DropdownMenuItem
                    className="cursor-pointer border-t p-2 mt-2"
                    onSelect={() => {
                      openAddContactDialog();
                      setDropdownOpen(false);
                    }}
                  >
                    <div className="flex items-center text-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Add new customer
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={isNextDisabled}>
          Next
        </Button>
      </div>
    </div>
  );
}
