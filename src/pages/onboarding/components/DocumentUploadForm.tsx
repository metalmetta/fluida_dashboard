
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DocumentUploadFormProps {
  businessLicense: File | null;
  setBusinessLicense: (file: File | null) => void;
  incorporationCertificate: File | null;
  setIncorporationCertificate: (file: File | null) => void;
  bankStatement: File | null;
  setBankStatement: (file: File | null) => void;
}

export function DocumentUploadForm({
  businessLicense,
  setBusinessLicense,
  incorporationCertificate,
  setIncorporationCertificate,
  bankStatement,
  setBankStatement,
}: DocumentUploadFormProps) {
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFileState: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileState(e.target.files[0]);
    }
  };

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
}
