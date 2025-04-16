
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";

const contactSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  consentProvided: z.boolean().refine(value => value === true, {
    message: "You must agree to the terms and conditions"
  }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactStep() {
  const { 
    onboardingData, 
    updateContactInformation, 
    setCurrentStep 
  } = useOnboarding();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: onboardingData.contactInformation.email,
      phoneNumber: onboardingData.contactInformation.phoneNumber,
      consentProvided: true,
    }
  });

  const onSubmit = (data: ContactFormValues) => {
    const { consentProvided, ...contactData } = data;
    updateContactInformation(contactData);
    setCurrentStep(5);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h3 className="text-lg font-medium">Business Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Email*</FormLabel>
                <FormControl>
                  <Input placeholder="contact@yourcompany.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Phone Number*</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 pt-4">
          <FormField
            control={form.control}
            name="consentProvided"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-normal">
                    I certify that all the information provided is accurate and complete. I agree to the terms and conditions, as well as the privacy policy.
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => setCurrentStep(3)}>
            Back
          </Button>
          <Button type="submit">Review</Button>
        </div>
      </form>
    </Form>
  );
}
