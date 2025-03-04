
import { BusinessDetails, KybDocument } from "@/hooks/use-kyb";
import { Check } from "lucide-react";

interface ReviewSubmitStepProps {
  formData: BusinessDetails;
  documents: KybDocument[];
}

export default function ReviewSubmitStep({
  formData,
  documents,
}: ReviewSubmitStepProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-md border p-4 bg-gray-50">
        <h3 className="font-medium mb-2">Company Details</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-500">Legal Name:</div>
          <div>{formData.legal_name}</div>
          <div className="text-gray-500">Registration Number:</div>
          <div>{formData.registration_number}</div>
          <div className="text-gray-500">Tax ID:</div>
          <div>{formData.tax_id}</div>
        </div>
      </div>
      
      <div className="rounded-md border p-4 bg-gray-50">
        <h3 className="font-medium mb-2">Business Address</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-500">Address:</div>
          <div>{formData.address_line1}</div>
          <div className="text-gray-500">City:</div>
          <div>{formData.city}</div>
          <div className="text-gray-500">Postal Code:</div>
          <div>{formData.postal_code}</div>
          <div className="text-gray-500">Country:</div>
          <div>{formData.country}</div>
        </div>
      </div>
      
      <div className="rounded-md border p-4 bg-gray-50">
        <h3 className="font-medium mb-2">Submitted Documents</h3>
        <ul className="space-y-1 text-sm">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span className="capitalize">{doc.document_type.replace(/_/g, ' ')}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="rounded-md bg-blue-50 border border-blue-100 p-4">
        <p className="text-blue-800 text-sm">
          By submitting this application, you confirm that all information provided is accurate and complete.
          We will review your documents and may contact you for additional information if needed.
        </p>
      </div>
    </div>
  );
}
