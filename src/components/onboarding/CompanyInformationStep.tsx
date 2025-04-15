
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { businessSectors, businessIndustries, legalStructures } from "@/lib/onboardingOptions";

const companyInformationSchema = z.object({
  legalName: z.string().min(1, "Legal name is required"),
  tradingName: z.string().optional(),
  registrationNumber: z.string().min(1, "Registration number is required"),
  registrationDate: z.string().min(1, "Registration date is required"),
  taxIdentificationType: z.string().min(1, "Tax ID type is required"),
  taxIdentificationValue: z.string().min(1, "Tax ID is required"),
  countryOfIncorporation: z.string().min(1, "Country of incorporation is required"),
  legalStructure: z.string().min(1, "Legal structure is required"),
  businessSector: z.string().min(1, "Business sector is required"),
  businessIndustry: z.string().min(1, "Business industry is required"),
  website: z.string().url("Please enter a valid website URL").or(z.string().length(0)),
  status: z.string().min(1, "Status is required"),
});

type CompanyInformationFormValues = z.infer<typeof companyInformationSchema>;

export function CompanyInformationStep() {
  const { onboardingData, updateCompanyInformation, setCurrentStep, isStepComplete } = useOnboarding();
  
  const form = useForm<CompanyInformationFormValues>({
    resolver: zodResolver(companyInformationSchema),
    defaultValues: {
      legalName: onboardingData.companyInformation.legalName,
      tradingName: onboardingData.companyInformation.tradingName,
      registrationNumber: onboardingData.companyInformation.registrationNumber,
      registrationDate: onboardingData.companyInformation.registrationDate,
      taxIdentificationType: onboardingData.companyInformation.taxIdentificationType,
      taxIdentificationValue: onboardingData.companyInformation.taxIdentificationValue,
      countryOfIncorporation: onboardingData.companyInformation.countryOfIncorporation,
      legalStructure: onboardingData.companyInformation.legalStructure,
      businessSector: onboardingData.companyInformation.businessSector,
      businessIndustry: onboardingData.companyInformation.businessIndustry,
      website: onboardingData.companyInformation.website,
      status: onboardingData.companyInformation.status,
    }
  });

  const onSubmit = (data: CompanyInformationFormValues) => {
    updateCompanyInformation(data);
    setCurrentStep(2);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="legalName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Legal Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Legal company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tradingName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trading Name</FormLabel>
                <FormControl>
                  <Input placeholder="Trading or DBA name (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registrationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registration Number*</FormLabel>
                <FormControl>
                  <Input placeholder="Company registration number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registrationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registration Date*</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxIdentificationType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax ID Type*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tax ID type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ein">EIN (Employer Identification Number)</SelectItem>
                    <SelectItem value="itin">ITIN (Individual Taxpayer Identification Number)</SelectItem>
                    <SelectItem value="ssn">SSN (Social Security Number)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxIdentificationValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax ID Value*</FormLabel>
                <FormControl>
                  <Input placeholder="Tax ID number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="countryOfIncorporation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country of Incorporation*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="legalStructure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Legal Structure*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select legal structure" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {legalStructures.map(structure => (
                      <SelectItem key={structure.value} value={structure.value}>
                        {structure.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessSector"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Sector*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business sector" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {businessSectors.map(sector => (
                      <SelectItem key={sector.value} value={sector.value}>
                        {sector.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessIndustry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Industry*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business industry" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {businessIndustries.map(industry => (
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="https://yourcompany.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </Form>
  );
}
