
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { Contact, ContactFormData } from "@/types/contact";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useContacts } from "@/hooks/useContacts";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  company: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  type: z.enum(["Customer", "Vendor", "Other"]),
  logo: z.any().optional(),
});

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
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const { addContact } = useContacts();

  // Controlled or uncontrolled dialog
  const isControlled = open !== undefined && onOpenChange !== undefined;
  const isOpen = isControlled ? open : isDialogOpen;
  const setIsOpen = isControlled ? onOpenChange : setIsDialogOpen;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      type: defaultType,
      logo: undefined,
    },
  });

  // Use useCallback to prevent unnecessary re-renders
  const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "image/jpeg" && file.type !== "image/png" && file.type !== "image/jpg") {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG or PNG image",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
      };

      reader.readAsDataURL(file);
      form.setValue("logo", file);
    }
  }, [form, toast]);

  const onSubmit = useCallback(async (data: ContactFormData) => {
    try {
      const result = await addContact(data);
      if (result) {
        setIsOpen(false);
        form.reset();
        setLogoPreview(null);
        toast({ title: "Success", description: "Contact added successfully" });
        if (onSuccess) onSuccess(result);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive",
      });
    }
  }, [addContact, form, toast, setIsOpen, onSuccess]);

  // Use memoized form fields to prevent focus loss during typing
  const ContactForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4">
          {logoPreview && (
            <div className="relative w-20 h-20 mx-auto mb-4">
              <img
                src={logoPreview}
                alt="Contact logo preview"
                className="w-full h-full object-cover rounded-full"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 rounded-full p-0 w-6 h-6"
                onClick={() => {
                  setLogoPreview(null);
                  form.setValue("logo", undefined);
                }}
              >
                <span className="sr-only">Remove image</span>
                ✕
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter company" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Customer">Customer</SelectItem>
                    <SelectItem value="Vendor">Vendor</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Logo (optional)</FormLabel>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="logo-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG (MAX. 2MB)
                  </p>
                </div>
                <input
                  id="logo-upload"
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleLogoChange}
                  aria-describedby="logo-upload-description"
                />
              </label>
            </div>
            <p id="logo-upload-description" className="sr-only">
              Upload a company logo or profile picture. Accepts PNG or JPG format.
            </p>
          </FormItem>
        </div>

        <DialogFooter>
          <Button type="submit">Add Contact</Button>
        </DialogFooter>
      </form>
    </Form>
  );

  // If controlled externally, just render the dialog
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
          <ContactForm />
        </DialogContent>
      </Dialog>
    );
  }

  // Uncontrolled dialog with trigger button
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
        <ContactForm />
      </DialogContent>
    </Dialog>
  );
}
