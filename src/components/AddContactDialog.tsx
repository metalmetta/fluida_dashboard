
import { useState } from "react";
import { Plus } from "lucide-react";
import { Contact } from "@/types/contact";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ContactForm } from "@/components/contact/ContactForm";

type AddContactDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultType?: "Customer" | "Vendor" | "Other";
  onSuccess?: (newContact: Contact) => void;
};

export function AddContactDialog({ 
  open, 
  onOpenChange,
  defaultType = "Customer",
  onSuccess 
}: AddContactDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const isOpen = isControlled ? open : isDialogOpen;
  const setIsOpen = isControlled ? onOpenChange : setIsDialogOpen;

  if (isControlled) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Create a new contact to use in your invoices and bills.
            </DialogDescription>
          </DialogHeader>
          <ContactForm 
            defaultType={defaultType} 
            onSuccess={onSuccess} 
            onClose={() => setIsOpen(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add contact
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Create a new contact to use in your invoices and bills.
          </DialogDescription>
        </DialogHeader>
        <ContactForm 
          defaultType={defaultType} 
          onSuccess={onSuccess} 
          onClose={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
