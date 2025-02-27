
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";

interface AddVendorDialogProps {
  onAddVendor: (vendor: {
    name: string;
    email: string;
    address: string;
    country: string;
    walletAddress: string;
    bankDetails: {
      bankName: string;
      accountNumber: string;
      routingNumber: string;
      accountHolderName: string;
    };
  }) => Promise<void>;
}

export function AddVendorDialog({ onAddVendor }: AddVendorDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: "",
    email: "",
    address: "",
    country: "",
    walletAddress: "",
    bankDetails: {
      bankName: "",
      accountNumber: "",
      routingNumber: "",
      accountHolderName: ""
    }
  });

  const handleSubmit = async () => {
    await onAddVendor(newVendor);
    setIsOpen(false);
    setNewVendor({
      name: "",
      email: "",
      address: "",
      country: "",
      walletAddress: "",
      bankDetails: {
        bankName: "",
        accountNumber: "",
        routingNumber: "",
        accountHolderName: ""
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Vendor</DialogTitle>
          <DialogDescription>
            Enter the vendor's details below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Vendor Name</Label>
              <Input
                value={newVendor.name}
                onChange={e => setNewVendor({...newVendor, name: e.target.value})}
                placeholder="Vendor Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newVendor.email}
                onChange={e => setNewVendor({...newVendor, email: e.target.value})}
                placeholder="Email Address"
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={newVendor.address}
                onChange={e => setNewVendor({...newVendor, address: e.target.value})}
                placeholder="Full Address"
              />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Select
                value={newVendor.country}
                onValueChange={(value) => setNewVendor({...newVendor, country: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="EU">European Union</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input
                value={newVendor.bankDetails.bankName}
                onChange={e => setNewVendor({
                  ...newVendor,
                  bankDetails: {...newVendor.bankDetails, bankName: e.target.value}
                })}
                placeholder="Bank Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input
                value={newVendor.bankDetails.accountNumber}
                onChange={e => setNewVendor({
                  ...newVendor,
                  bankDetails: {...newVendor.bankDetails, accountNumber: e.target.value}
                })}
                placeholder="Account Number"
              />
            </div>
            <div className="space-y-2">
              <Label>Routing Number</Label>
              <Input
                value={newVendor.bankDetails.routingNumber}
                onChange={e => setNewVendor({
                  ...newVendor,
                  bankDetails: {...newVendor.bankDetails, routingNumber: e.target.value}
                })}
                placeholder="Routing Number"
              />
            </div>
            <div className="space-y-2">
              <Label>Account Holder Name</Label>
              <Input
                value={newVendor.bankDetails.accountHolderName}
                onChange={e => setNewVendor({
                  ...newVendor,
                  bankDetails: {...newVendor.bankDetails, accountHolderName: e.target.value}
                })}
                placeholder="Account Holder Name"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Add Vendor</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
