
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Search, Plus, Edit, Save, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Vendor {
  id: string;
  name: string;
  email: string;
  status: string;
  lastPayment: string;
}

const initialVendors = [
  {
    id: "V1",
    name: "Acme Corporation",
    email: "billing@acme.com",
    status: "Active",
    lastPayment: "Feb 15, 2024",
  },
  {
    id: "V2",
    name: "Tech Solutions Inc",
    email: "accounts@techsolutions.com",
    status: "Active",
    lastPayment: "Feb 10, 2024",
  },
  {
    id: "V3",
    name: "Global Services Ltd",
    email: "finance@globalservices.com",
    status: "Active",
    lastPayment: "Feb 5, 2024",
  },
];

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [editingVendor, setEditingVendor] = useState<string | null>(null);
  const [newVendor, setNewVendor] = useState({ name: "", email: "" });
  const [editForm, setEditForm] = useState<Vendor | null>(null);

  const handleAddVendor = () => {
    if (!newVendor.name || !newVendor.email) {
      toast.error("Please fill in all fields");
      return;
    }

    const vendor: Vendor = {
      id: `V${vendors.length + 1}`,
      name: newVendor.name,
      email: newVendor.email,
      status: "Active",
      lastPayment: "N/A",
    };

    setVendors([...vendors, vendor]);
    setNewVendor({ name: "", email: "" });
    setIsAddingVendor(false);
    toast.success("Vendor added successfully");
  };

  const handleEditVendor = (vendorId: string) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    if (vendor) {
      setEditingVendor(vendorId);
      setEditForm(vendor);
    }
  };

  const handleSaveEdit = () => {
    if (!editForm) return;

    setVendors(
      vendors.map((vendor) =>
        vendor.id === editForm.id ? editForm : vendor
      )
    );
    setEditingVendor(null);
    setEditForm(null);
    toast.success("Vendor updated successfully");
  };

  return (
    <DashboardLayout>
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
              <div className="border rounded-lg p-4 mb-4 space-y-4">
                <h3 className="font-medium">Add New Vendor</h3>
                <div className="space-y-4">
                  <Input
                    placeholder="Vendor Name"
                    value={newVendor.name}
                    onChange={(e) =>
                      setNewVendor({ ...newVendor, name: e.target.value })
                    }
                  />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={newVendor.email}
                    onChange={(e) =>
                      setNewVendor({ ...newVendor, email: e.target.value })
                    }
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleAddVendor}>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingVendor(false);
                        setNewVendor({ name: "", email: "" });
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search vendors..." className="pl-9" />
            </div>

            <div className="divide-y">
              {vendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-4">
                    <Avatar />
                    {editingVendor === vendor.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editForm?.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm!, name: e.target.value })
                          }
                          className="max-w-[200px]"
                        />
                        <Input
                          value={editForm?.email}
                          onChange={(e) =>
                            setEditForm({ ...editForm!, email: e.target.value })
                          }
                          className="max-w-[200px]"
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">{vendor.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {vendor.email}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground mr-4">
                      Last payment: {vendor.lastPayment}
                    </div>
                    {editingVendor === vendor.id ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                        >
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
    </DashboardLayout>
  );
}
