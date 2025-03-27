
import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, MinusCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { InvoiceFormData } from "@/types/invoice";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { generateInvoiceId } from "@/lib/billUtils";

interface LineItemsStepProps {
  form: InvoiceFormData;
  setForm: (form: InvoiceFormData) => void;
  updateItem: (index: number, field: string, value: any) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function LineItemsStep({
  form,
  setForm,
  updateItem,
  addItem,
  removeItem,
  onPrevious,
  onNext
}: LineItemsStepProps) {
  const isNextDisabled = form.items.some(item => !item.description || item.quantity <= 0 || item.price <= 0);

  // Update the invoice ID when date or client name changes
  const updateInvoiceId = useCallback(() => {
    if (form.client_name && form.issue_date) {
      const formattedId = generateInvoiceId(
        new Date(form.issue_date),
        form.client_name,
        form.invoice_number.replace(/^INV-.*-/, '') // Extract the invoice number part
      );
      setForm({ ...form, invoice_number: formattedId });
    }
  }, [form.client_name, form.issue_date, form.invoice_number, setForm]);

  // Handle date selection
  const handleDateSelect = (date: Date | undefined, field: 'issue_date' | 'due_date') => {
    const formattedDate = format(date || new Date(), "yyyy-MM-dd");
    setForm({ ...form, [field]: formattedDate });
    
    if (field === 'issue_date') {
      // Use setTimeout to ensure form state is updated
      setTimeout(() => updateInvoiceId(), 0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="invoice_number">Invoice ID</Label>
          <Input
            id="invoice_number"
            value={form.invoice_number}
            onChange={(e) => {
              setForm({ ...form, invoice_number: e.target.value });
              // Don't auto-update during direct edit
            }}
            readOnly // Make it read-only as it's auto-generated
            className="bg-gray-50"
          />
          <p className="text-xs text-muted-foreground">
            Auto-generated based on customer and date
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="issue_date">Issue Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.issue_date}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={new Date(form.issue_date)}
                onSelect={(date) => handleDateSelect(date, 'issue_date')}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.due_date}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={new Date(form.due_date)}
                onSelect={(date) => handleDateSelect(date, 'due_date')}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Line Items</h3>
          <Button type="button" onClick={addItem} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
        
        <div className="space-y-4">
          {form.items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-6">
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                />
              </div>
              <div className="col-span-1">
                <Input
                  type="number"
                  placeholder="Qty"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  placeholder="Price"
                  min="0"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => updateItem(index, "price", Number(e.target.value))}
                />
              </div>
              <div className="col-span-2">
                <Input
                  readOnly
                  value={item.amount.toFixed(2)}
                />
              </div>
              <div className="col-span-1 flex justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                  disabled={form.items.length <= 1}
                >
                  <MinusCircle className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onNext} disabled={isNextDisabled}>
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
