import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Search, Plus, Edit, Save, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Vendor {
  id: string;
  name: string;
  email: string;
  address: string;
  country: string;
  walletAddress?: string; // Optional
  bankDetails: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    accountHolderName: string;
  };
  status: string;
  lastPayment: string;
}

const initialVendors = [{
  id: "V1",
  name: "Acme Corporation",
  email: "billing@acme.com",
  address: "123 Business Ave, New York, NY 10001",
  country: "US",
  walletAddress: "0x1234...5678",
  bankDetails: {
    bankName: "Chase Bank",
    accountNumber: "****4567",
    routingNumber: "***1234",
    accountHolderName: "Acme Corp"
  },
  status: "Active",
  lastPayment: "Feb 15, 2024"
}, {
  id: "V2",
  name: "Tech Solutions Inc",
  email: "accounts@techsolutions.com",
  address: "456 Tech Park, San Francisco, CA 94105",
  country: "US",
  bankDetails: {
    bankName: "Bank of America",
    accountNumber: "****7890",
    routingNumber: "***5678",
    accountHolderName: "Tech Solutions Inc"
  },
  status: "Active",
  lastPayment: "Feb 10, 2024"
}, {
  id: "V3",
  name: "Global Services Ltd",
  email: "finance@globalservices.com",
  address: "789 Global Tower, London, UK SW1A 1AA",
  country: "UK",
  walletAddress: "0x9876...4321",
  bankDetails: {
    bankName: "Barclays",
    accountNumber: "****2345",
    routingNumber: "***9012",
    accountHolderName: "Global Services Ltd"
  },
  status: "Active",
  lastPayment: "Feb 5, 2024"
}];

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [editingVendor, setEditingVendor] = useState<string | null>(null);
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
  const [editForm, setEditForm] = useState<Vendor | null>(null);

  const handleAddVendor = () => {
    if (!newVendor.name || !newVendor.email || !newVendor.address || !newVendor.country || 
        !newVendor.bankDetails.bankName || !newVendor.bankDetails.accountNumber || 
        !newVendor.bankDetails.routingNumber || !newVendor.bankDetails.accountHolderName) {
      toast.error("Please fill in all required fields");
      return;
    }

    const vendor: Vendor = {
      id: `V${vendors.length + 1}`,
      ...newVendor,
      status: "Active",
      lastPayment: "N/A"
    };

    setVendors([...vendors, vendor]);
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
    setIsAddingVendor(false);
    toast.success("Vendor added successfully");
  };

  const handleEditVendor = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      setEditingVendor(vendorId);
      setEditForm(vendor);
    }
  };

  const handleSaveEdit = () => {
    if (!editForm) return;
    setVendors(vendors.map(vendor => vendor.id === editForm.id ? editForm : vendor));
    setEditingVendor(null);
    setEditForm(null);
    toast.success("Vendor updated successfully");
  };

  return <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Vendors</h1>
          <Button onClick={() => setIsAddingVendor(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
        </div>

        <Card>
          <div className="p-6 space-y-6">
            {isAddingVendor && (
              <div className="space-y-6 border rounded-lg p-6">
                <h3 className="font-medium">Add New Vendor</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Vendor Name *</Label>
                      <Input
                        id="name"
                        placeholder="Vendor Name"
                        value={newVendor.name}
                        onChange={e => setNewVendor({
                          ...newVendor,
                          name: e.target.value
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Email Address"
                        value={newVendor.email}
                        onChange={e => setNewVendor({
                          ...newVendor,
                          email: e.target.value
                        })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        placeholder="Full Address"
                        value={newVendor.address}
                        onChange={e => setNewVendor({
                          ...newVendor,
                          address: e.target.value
                        })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Select
                        value={newVendor.country}
                        onValueChange={(value) => setNewVendor({
                          ...newVendor,
                          country: value
                        })}
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

                    <div>
                      <Label htmlFor="walletAddress">Wallet Address (Optional)</Label>
                      <Input
                        id="walletAddress"
                        placeholder="Wallet Address"
                        value={newVendor.walletAddress}
                        onChange={e => setNewVendor({
                          ...newVendor,
                          walletAddress: e.target.value
                        })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Bank Account Details</h4>
                    
                    <div>
                      <Label htmlFor="bankName">Bank Name *</Label>
                      <Input
                        id="bankName"
                        placeholder="Bank Name"
                        value={newVendor.bankDetails.bankName}
                        onChange={e => setNewVendor({
                          ...newVendor,
                          bankDetails: {
                            ...newVendor.bankDetails,
                            bankName: e.target.value
                          }
                        })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="accountNumber">Account Number *</Label>
                      <Input
                        id="accountNumber"
                        placeholder="Account Number"
                        value={newVendor.bankDetails.accountNumber}
                        onChange={e => setNewVendor({
                          ...newVendor,
                          bankDetails: {
                            ...newVendor.bankDetails,
                            accountNumber: e.target.value
                          }
                        })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="routingNumber">Routing Number *</Label>
                      <Input
                        id="routingNumber"
                        placeholder="Routing Number"
                        value={newVendor.bankDetails.routingNumber}
                        onChange={e => setNewVendor({
                          ...newVendor,
                          bankDetails: {
                            ...newVendor.bankDetails,
                            routingNumber: e.target.value
                          }
                        })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                      <Input
                        id="accountHolderName"
                        placeholder="Account Holder Name"
                        value={newVendor.bankDetails.accountHolderName}
                        onChange={e => setNewVendor({
                          ...newVendor,
                          bankDetails: {
                            ...newVendor.bankDetails,
                            accountHolderName: e.target.value
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button onClick={handleAddVendor}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsAddingVendor(false);
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
                  }}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search vendors..." className="pl-9" />
            </div>

            <div className="divide-y">
              {vendors.map(vendor => (
                <div key={vendor.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <Avatar />
                    {editingVendor === vendor.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editForm?.name}
                          onChange={e => setEditForm({
                            ...editForm!,
                            name: e.target.value
                          })}
                          className="max-w-[200px]"
                        />
                        <Input
                          value={editForm?.email}
                          onChange={e => setEditForm({
                            ...editForm!,
                            email: e.target.value
                          })}
                          className="max-w-[200px]"
                        />
                        <Input
                          value={editForm?.address}
                          onChange={e => setEditForm({
                            ...editForm!,
                            address: e.target.value
                          })}
                          className="max-w-[200px]"
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">{vendor.name}</p>
                        <p className="text-sm text-muted-foreground">{vendor.email}</p>
                        <p className="text-sm text-muted-foreground">{vendor.address}</p>
                        {vendor.walletAddress && (
                          <p className="text-sm text-muted-foreground">
                            Wallet: {vendor.walletAddress}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground mr-4">
                      Last payment: {vendor.lastPayment}
                    </div>
                    {editingVendor === vendor.id ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingVendor(null);
                            setEditForm(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditVendor(vendor.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>;
}