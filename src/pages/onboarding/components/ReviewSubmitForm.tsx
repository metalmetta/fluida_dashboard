
interface ReviewSubmitFormProps {
  companyName: string;
  industry: string;
  website: string;
  phoneNumber: string;
  taxId: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  businessLicense: File | null;
  incorporationCertificate: File | null;
  bankStatement: File | null;
}

export function ReviewSubmitForm({
  companyName,
  industry,
  website,
  phoneNumber,
  taxId,
  street,
  city,
  state,
  postalCode,
  country,
  businessLicense,
  incorporationCertificate,
  bankStatement,
}: ReviewSubmitFormProps) {
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
}
