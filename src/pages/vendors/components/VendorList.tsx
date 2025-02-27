
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { VendorListItem } from "./VendorListItem";

interface VendorListProps {
  vendors: any[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  editingVendor: string | null;
  editForm: any;
  onEditVendor: (vendor: any) => void;
  onSaveEdit: () => Promise<void>;
  onCancelEdit: () => void;
  onEditFormChange: (form: any) => void;
}

export function VendorList({
  vendors,
  searchQuery,
  onSearchChange,
  editingVendor,
  editForm,
  onEditVendor,
  onSaveEdit,
  onCancelEdit,
  onEditFormChange,
}: VendorListProps) {
  return (
    <Card>
      <div className="p-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="divide-y">
          {vendors.map((vendor) => (
            <VendorListItem
              key={vendor.id}
              vendor={vendor}
              isEditing={editingVendor === vendor.id}
              editForm={editForm}
              onEdit={onEditVendor}
              onSave={onSaveEdit}
              onCancel={onCancelEdit}
              onEditFormChange={onEditFormChange}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
