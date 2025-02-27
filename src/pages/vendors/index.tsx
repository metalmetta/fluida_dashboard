
import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddVendorDialog } from "./components/AddVendorDialog";
import { VendorList } from "./components/VendorList";
import { useAuth } from "@/components/AuthProvider";

export default function Vendors() {
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingVendor, setEditingVendor] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);

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

  const handleAddVendor = async (newVendor: any) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to add vendors");
      return;
    }

    try {
      const { error } = await supabase
        .from('vendors')
        .insert([{
          user_id: session.user.id, // Add user_id to link vendor to current user
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
          <AddVendorDialog onAddVendor={handleAddVendor} />
        </div>

        <VendorList
          vendors={filteredVendors}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          editingVendor={editingVendor}
          editForm={editForm}
          onEditVendor={handleEditVendor}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={() => setEditingVendor(null)}
          onEditFormChange={setEditForm}
        />
      </div>
    </DashboardLayout>
  );
}
