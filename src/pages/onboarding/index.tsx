import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingStepper } from "@/components/OnboardingStepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, FileText, MapPin, Loader2 } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Company Details",
    description: "Basic information about your business"
  },
  {
    number: 2,
    title: "Business Address",
    description: "Where your business operates"
  },
  {
    number: 3,
    title: "Document Upload",
    description: "Required legal documents"
  },
  {
    number: 4,
    title: "Review & Submit",
    description: "Verify your information"
  }
];

const companyDetailsSchema = z.object({
  legal_name: z.string().min(2, "Business name is required"),
  registration_number: z.string().min(1, "Registration number is required"),
  tax_id: z.string().min(1, "Tax ID is required"),
  contact_name: z.string().min(2, "Contact name is required"),
  contact_email: z.string().email("Invalid email address"),
  contact_phone: z.string().min(10, "Valid phone number is required")
});

const addressSchema = z.object({
  address_line1: z.string().min(1, "Address is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required")
});

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();

  // Add state for file uploads
  const [businessRegistrationFile, setBusinessRegistrationFile] = useState<File | null>(null);
  const [taxRegistrationFile, setTaxRegistrationFile] = useState<File | null>(null);
  const [proofOfAddressFile, setProofOfAddressFile] = useState<File | null>(null);

  const companyForm = useForm<z.infer<typeof companyDetailsSchema>>({
    resolver: zodResolver(companyDetailsSchema)
  });

  const addressForm = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema)
  });

  const handleCompanySubmit = async (data: z.infer<typeof companyDetailsSchema>) => {
    try {
      setCurrentStep(2);
    } catch (error) {
      toast.error("Error saving company details");
    }
  };

  const handleAddressSubmit = async (data: z.infer<typeof addressSchema>) => {
    try {
      setCurrentStep(3);
    } catch (error) {
      toast.error("Error saving address");
    }
  };

  const uploadFile = async (file: File, path: string) => {
    try {
      // First check if the file is too large (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`File ${file.name} is too large. Maximum size is 5MB`);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${session?.user?.id}/${path}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('kyb-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading file:', error);
        throw new Error(`Error uploading ${file.name}: ${error.message}`);
      }

      // Get the public URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from('kyb-documents')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Error in uploadFile:', error);
      throw new Error(`Failed to upload ${file.name}: ${error.message}`);
    }
  };

  const handleFinalSubmit = async () => {
    if (!session?.user?.id) {
      toast.error("Please log in to continue");
      return;
    }

    if (!businessRegistrationFile || !taxRegistrationFile || !proofOfAddressFile) {
      toast.error("Please upload all required documents");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload files with better error handling
      const uploadPromises = [
        {
          file: businessRegistrationFile,
          path: 'business-registration',
          field: 'business_registration_doc'
        },
        {
          file: taxRegistrationFile,
          path: 'tax-registration',
          field: 'tax_registration_doc'
        },
        {
          file: proofOfAddressFile,
          path: 'proof-of-address',
          field: 'proof_of_address_doc'
        }
      ].map(async ({ file, path, field }) => {
        try {
          const url = await uploadFile(file, path);
          return { [field]: url };
        } catch (error: any) {
          throw new Error(`Error uploading ${path}: ${error.message}`);
        }
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const fileUrls = uploadedFiles.reduce((acc, curr) => ({ ...acc, ...curr }), {});

      const companyData = companyForm.getValues();
      const addressData = addressForm.getValues();

      const { error: insertError } = await supabase
        .from('business_details')
        .insert([{
          legal_name: companyData.legal_name,
          registration_number: companyData.registration_number,
          tax_id: companyData.tax_id,
          contact_name: companyData.contact_name,
          contact_email: companyData.contact_email,
          contact_phone: companyData.contact_phone,
          ...addressData,
          ...fileUrls,
          user_id: session.user.id,
          kyb_status: 'PENDING',
          kyb_submitted_at: new Date().toISOString()
        }]);

      if (insertError) {
        console.error('Error inserting business details:', insertError);
        throw new Error(insertError.message);
      }

      toast.success("Business details submitted successfully!");
      navigate('/pending-approval');
    } catch (error: any) {
      console.error('Error in handleFinalSubmit:', error);
      toast.error(error.message || "Error submitting business details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/50">
      <div className="container max-w-5xl mx-auto py-8">
        <div className="mb-12 pt-8">
          <OnboardingStepper steps={steps} currentStep={currentStep} />
        </div>
        
        <Card className="mt-16 animate-in slide-in-from-bottom-4">
          <CardHeader>
            <div className="flex items-center gap-4">
              {currentStep === 1 && <Building2 className="w-8 h-8 text-primary" />}
              {currentStep === 2 && <MapPin className="w-8 h-8 text-primary" />}
              {currentStep === 3 && <FileText className="w-8 h-8 text-primary" />}
              <div>
                <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                <CardDescription>{steps[currentStep - 1].description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <Form {...companyForm}>
                <form onSubmit={companyForm.handleSubmit(handleCompanySubmit)} className="space-y-6">
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    <FormField
                      control={companyForm.control}
                      name="legal_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your company name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="registration_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Business registration number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="tax_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Tax identification number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="contact_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Primary contact person" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="contact_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contact@company.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="contact_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 000-0000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" className="w-full md:w-auto">
                      Next Step
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {currentStep === 2 && (
              <Form {...addressForm}>
                <form onSubmit={addressForm.handleSubmit(handleAddressSubmit)} className="space-y-6">
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    <FormField
                      control={addressForm.control}
                      name="address_line1"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Address Line 1</FormLabel>
                          <FormControl>
                            <Input placeholder="Street address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addressForm.control}
                      name="address_line2"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Address Line 2 (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Apartment, suite, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addressForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addressForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addressForm.control}
                      name="postal_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Postal code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addressForm.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="US">United States</SelectItem>
                              <SelectItem value="CA">Canada</SelectItem>
                              <SelectItem value="GB">United Kingdom</SelectItem>
                              {/* Add more countries as needed */}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                      Back
                    </Button>
                    <Button type="submit">
                      Next Step
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid gap-6">
                  <div className="border rounded-lg p-4 hover:bg-secondary/5 transition-colors">
                    <Label className="font-medium mb-2 block">Business Registration Document</Label>
                    <Input 
                      type="file" 
                      className="cursor-pointer" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setBusinessRegistrationFile(e.target.files?.[0] || null)}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Upload a scanned copy of your business registration certificate (PDF or image)
                    </p>
                  </div>
                  <div className="border rounded-lg p-4 hover:bg-secondary/5 transition-colors">
                    <Label className="font-medium mb-2 block">Tax Registration Document</Label>
                    <Input 
                      type="file" 
                      className="cursor-pointer" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setTaxRegistrationFile(e.target.files?.[0] || null)}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Upload a scanned copy of your tax registration document (PDF or image)
                    </p>
                  </div>
                  <div className="border rounded-lg p-4 hover:bg-secondary/5 transition-colors">
                    <Label className="font-medium mb-2 block">Proof of Address</Label>
                    <Input 
                      type="file" 
                      className="cursor-pointer" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setProofOfAddressFile(e.target.files?.[0] || null)}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Upload a recent utility bill or bank statement showing your business address
                    </p>
                  </div>
                </div>
        <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                    Back
                  </Button>
          <Button
                    onClick={() => setCurrentStep(4)}
                    disabled={!businessRegistrationFile || !taxRegistrationFile || !proofOfAddressFile}
                  >
                    Next Step
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Company Details
                    </h3>
                    <dl className="grid grid-cols-2 gap-4">
                      {Object.entries(companyForm.getValues()).map(([key, value]) => (
                        <div key={key}>
                          <dt className="text-sm text-muted-foreground">{key.replace(/_/g, ' ').toUpperCase()}</dt>
                          <dd className="font-medium">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Business Address
                    </h3>
                    <dl className="grid grid-cols-2 gap-4">
                      {Object.entries(addressForm.getValues()).map(([key, value]) => (
                        <div key={key}>
                          <dt className="text-sm text-muted-foreground">{key.replace(/_/g, ' ').toUpperCase()}</dt>
                          <dd className="font-medium">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Uploaded Documents
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        {businessRegistrationFile?.name || "Business Registration Document"}
                      </li>
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        {taxRegistrationFile?.name || "Tax Registration Document"}
                      </li>
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        {proofOfAddressFile?.name || "Proof of Address"}
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(3)}>
            Back
          </Button>
                  <Button 
                    onClick={handleFinalSubmit} 
                    disabled={isSubmitting}
                    className="min-w-[200px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit for Review
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
          </Button>
        </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
