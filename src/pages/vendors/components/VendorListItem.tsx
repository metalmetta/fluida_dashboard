
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Save, X } from "lucide-react";

interface VendorListItemProps {
  vendor: {
    id: string;
    name: string;
    email: string;
  };
  isEditing: boolean;
  editForm: any;
  onEdit: (vendor: any) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  onEditFormChange: (form: any) => void;
}

export function VendorListItem({
  vendor,
  isEditing,
  editForm,
  onEdit,
  onSave,
  onCancel,
  onEditFormChange,
}: VendorListItemProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <Avatar />
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editForm?.name}
              onChange={e => onEditFormChange({
                ...editForm,
                name: e.target.value
              })}
              className="max-w-[200px]"
            />
            <Input
              value={editForm?.email}
              onChange={e => onEditFormChange({
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
        {isEditing ? (
          <>
            <Button variant="ghost" size="sm" onClick={onSave}>
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => onEdit(vendor)}>
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
