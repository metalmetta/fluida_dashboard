
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Vendors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingVendor, setEditingVendor] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [isAddingVendor, setIsAddingVendor] = useState(false);
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

  const { data: vendors = [], refetch } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Error loading vendors");
        throw error;
      }
      return data;
    }
  });

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditVendor = (vendor: any) => {
    setEditingVendor(vendor.id);
    setEditForm(vendor);
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;

    try {
      const { error } = await supabase
        .from('vendors')
        .update({
          name: editForm.name,
          email: editForm.email,
          address: editForm.address,
          wallet_address: editForm.wallet_address
        })
        .eq('id', editForm.id);

      if (error) throw error;

      toast.success("Vendor updated successfully");
      setEditingVendor(null);
      setEditForm(null);
      refetch();
    } catch (error: any) {
      toast.error("Error updating vendor");
      console.error(error);
    }
  };

  const handleAddVendor = async () => {
    try {
      const { error } = await supabase
        .from('vendors')
        .insert([{
          name: newVendor.name,
          email: newVendor.email,
          address: newVendor.address,
          country: newVendor.country,
          wallet_address: newVendor.walletAddress,
          bank_name: newVendor.bankDetails.bankName,
          bank_account_number: newVendor.bankDetails.accountNumber,
          bank_routing_number: newVendor.bankDetails.routingNumber,
          bank_holder_name: newVendor.bankDetails.accountHolderName,
          status: 'active'
        }]);

      if (error) throw error;

      toast.success("Vendor added successfully");
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
      refetch();
    } catch (error: any) {
      toast.error("Error adding vendor");
      console.error(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Vendors</h1>
          <Dialog open={isAddingVendor} onOpenChange={setIsAddingVendor}>
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
                <Button onClick={handleAddVendor}>Add Vendor</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <div className="p-6 space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="divide-y">
              {filteredVendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <Avatar />
                    {editingVendor === vendor.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editForm?.name}
                          onChange={e => setEditForm({
                            ...editForm,
                            name: e.target.value
                          })}
                          className="max-w-[200px]"
                        />
                        <Input
                          value={editForm?.email}
                          onChange={e => setEditForm({
                            ...editForm,
                            email: e.target.value
                          })}
                          className="max-w-[200px]"
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">{vendor.name}</p>
                        <p className="text-sm text-muted-foreground">{vendor.email}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {editingVendor === vendor.id ? (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleSaveEdit()}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingVendor(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => handleEditVendor(vendor)}>
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
    </DashboardLayout>
  );
}
