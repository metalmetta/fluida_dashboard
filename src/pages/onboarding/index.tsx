
import { useState, useEffect } from "react";
import { Check, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { BusinessDetails } from "@/types/column.types";

export default function Onboarding() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Company Details State
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [taxId, setTaxId] = useState("");
  const [description, setDescription] = useState("");
  
  // Business Address State
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("United States");
  
  // Document Uploads
  const [businessLicense, setBusinessLicense] = useState<File | null>(null);
  const [incorporationCertificate, setIncorporationCertificate] = useState<File | null>(null);
  const [bankStatement, setBankStatement] = useState<File | null>(null);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      // Load company name from user metadata
      setCompanyName(session.user.user_metadata?.company_name || "");
      
      // Load any saved business details from the database
      loadBusinessDetails();
    }
  }, [session]);

  const loadBusinessDetails = async () => {
    if (!session?.user) return;
    
    try {
      const { data, error } = await supabase
        .from("business_details")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Populate form with saved data
        setCompanyName(data.company_name || companyName);
        setIndustry(data.industry || "");
        setWebsite(data.website || "");
        setPhoneNumber(data.phone || "");
        setTaxId(data.tax_id || "");
        setDescription(data.description || "");
        setStreet(data.street || "");
        setCity(data.city || "");
        setState(data.state || "");
        setPostalCode(data.postal_code || "");
        setCountry(data.country || "United States");
      }
    } catch (error) {
      console.error("Error loading business details:", error);
    }
  };

  const saveBusinessDetails = async () => {
    if (!session?.user) return;
    
    try {
      // Check if we already have a record
      const { data, error } = await supabase
        .from("business_details")
        .select("id")
        .eq("user_id", session.user.id)
        .single();
      
      const businessData = {
        user_id: session.user.id,
        company_name: companyName,
        industry,
        website,
        phone: phoneNumber,
        tax_id: taxId,
        description,
        street,
        city,
        state,
        postal_code: postalCode,
        country,
        status: "kyb_submitted"
      };
      
      if (error && error.code === "PGRST116") {
        // Record doesn't exist, create new
        await supabase.from("business_details").insert(businessData);
      } else {
        // Record exists, update it
        await supabase
          .from("business_details")
          .update(businessData)
          .eq("user_id", session.user.id);
      }
      
      // Update user metadata
      await supabase.auth.updateUser({
        data: {
          business_status: "kyb_submitted"
        }
      });
    } catch (error) {
      console.error("Error saving business details:", error);
      throw error;
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFileState: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileState(e.target.files[0]);
    }
  };

  const uploadDocuments = async () => {
    if (!session?.user) return;
    
    try {
      // Upload business license
      if (businessLicense) {
        const { error: licenseError } = await supabase.storage
          .from("kyb_documents")
          .upload(
            `${session.user.id}/business_license_${Date.now()}`,
            businessLicense
          );
        if (licenseError) throw licenseError;
      }
      
      // Upload incorporation certificate
      if (incorporationCertificate) {
        const { error: certError } = await supabase.storage
          .from("kyb_documents")
          .upload(
            `${session.user.id}/incorporation_certificate_${Date.now()}`,
            incorporationCertificate
          );
        if (certError) throw certError;
      }
      
      // Upload bank statement
      if (bankStatement) {
        const { error: statementError } = await supabase.storage
          .from("kyb_documents")
          .upload(
            `${session.user.id}/bank_statement_${Date.now()}`,
            bankStatement
          );
        if (statementError) throw statementError;
      }
      
      // Update business details record to indicate documents uploaded
      await supabase
        .from("business_details")
        .update({ documents_uploaded: true })
        .eq("user_id", session.user.id);
      
    } catch (error) {
      console.error("Error uploading documents:", error);
      throw error;
    }
  };

  const createColumnEntityAndAccount = async () => {
    if (!session?.user) return;
    
    try {
      const businessDetails: BusinessDetails = {
        companyName,
        street,
        city,
        state,
        postalCode,
        country,
        phone: phoneNumber,
        email: session.user.email || "",
        taxId,
      };

      // Call our edge function to create Column entity and bank account
      const response = await supabase.functions.invoke("column-integration", {
        body: { businessDetails, userId: session.user.id }
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to create Column entity");
      }

      const { data } = response;

      // Save Column IDs to the business_details table
      await supabase
        .from("business_details")
        .update({
          column_entity_id: data.entity.id,
          column_bank_account_id: data.bankAccount.id,
          column_routing_number: data.bankAccount.routingNumber,
          column_account_number: data.bankAccount.accountNumber
        })
        .eq("user_id", session.user.id);

      return data;
    } catch (error) {
      console.error("Error creating Column entity and account:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      await saveBusinessDetails();
      
      if (currentStep === 3) {
        await uploadDocuments();
      }
      
      if (currentStep === 4) {
        // Final step - create Column entity and bank account
        await createColumnEntityAndAccount();
        
        // Update user metadata
        await supabase.auth.updateUser({
          data: {
            business_status: "approved" // Auto-approve for demo purposes
          }
        });
        
        toast.success("Business onboarding complete! Your account is now active.");
        navigate("/");
        return;
      }
      
      setCurrentStep(prev => prev + 1);
      toast.success("Information saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Company Details</h2>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID / EIN</Label>
              <Input
                id="taxId"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Business Address</h2>
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State / Province</Label>
              <Input
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal / ZIP Code</Label>
              <Input
                id="postalCode"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Document Upload</h2>
            <p className="text-gray-600">
              Please upload the following documents to verify your business.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="businessLicense">Business License</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="businessLicense"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, setBusinessLicense)}
                  className="flex-1"
                />
                {businessLicense && <Check className="text-green-500" />}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="incorporationCertificate">
                Certificate of Incorporation
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="incorporationCertificate"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, setIncorporationCertificate)}
                  className="flex-1"
                />
                {incorporationCertificate && <Check className="text-green-500" />}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bankStatement">Recent Bank Statement</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="bankStatement"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, setBankStatement)}
                  className="flex-1"
                />
                {bankStatement && <Check className="text-green-500" />}
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Review & Submit</h2>
            <p className="text-gray-600 mb-4">
              Please review your information before submission. We'll create your business banking account after verification.
            </p>
            
            <div className="space-y-4 p-4 bg-gray-50 rounded-md">
              <div>
                <h3 className="font-medium">Company Information</h3>
                <p>Name: {companyName}</p>
                <p>Industry: {industry}</p>
                <p>Website: {website || "N/A"}</p>
                <p>Phone: {phoneNumber}</p>
                <p>Tax ID: {taxId}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Business Address</h3>
                <p>{street}</p>
                <p>{city}, {state} {postalCode}</p>
                <p>{country}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Uploaded Documents</h3>
                <p>Business License: {businessLicense ? "✓" : "✗"}</p>
                <p>Incorporation Certificate: {incorporationCertificate ? "✓" : "✗"}</p>
                <p>Bank Statement: {bankStatement ? "✓" : "✗"}</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Business Verification</h1>
        
        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex flex-col items-center ${
                currentStep >= step ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  currentStep >= step
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {step}
              </div>
              <span className="text-sm">
                {step === 1
                  ? "Company Details"
                  : step === 2
                  ? "Business Address"
                  : step === 3
                  ? "Document Upload"
                  : "Review & Submit"}
              </span>
            </div>
          ))}
        </div>
        
        {/* Content Area */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          {renderStep()}
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
            disabled={currentStep === 1 || isLoading}
          >
            Back
          </Button>
          
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading
              ? "Processing..."
              : currentStep === 4
              ? "Submit & Create Account"
              : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
