
import React from "react";

interface DocumentPreviewProps {
  documentType: "invoice" | "bill";
  documentData: {
    id: string;
    number: string;
    vendor_or_client: string;
    email?: string;
    issue_date: string;
    due_date: string;
    amount: number;
    description?: string;
    category?: string;
    payment_method?: string;
  };
}

export function DocumentPreview({ documentType, documentData }: DocumentPreviewProps) {
  const isInvoice = documentType === "invoice";
  const entityLabel = isInvoice ? "Client" : "Vendor";
  const documentLabel = isInvoice ? "INVOICE" : "BILL";
  
  // Format payment method for display
  const formatPaymentMethod = (method?: string) => {
    if (!method) return "";
    
    if (method === "bank_transfer") return "Bank Transfer";
    if (method === "blockchain_transfer") return "Blockchain Transfer";
    if (method === "credit_card") return "Credit Card";
    
    return method; // Return original if it's a custom value
  };
  
  return (
    <div className="w-full max-w-md bg-white shadow-lg rounded-md">
      <div className="p-6 border-b">
        <div className="flex justify-between">
          <div>
            <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold">
              {documentData.vendor_or_client.charAt(0)}
            </div>
            <p className="mt-2 font-semibold">{documentData.vendor_or_client}</p>
            <p className="text-sm text-gray-500">{documentData.email || `${entityLabel.toLowerCase()}@example.com`}</p>
          </div>
          <div className="text-right">
            <h3 className="font-bold">{documentLabel} #{documentData.number}</h3>
            <p className="text-sm text-gray-500">Issue Date: {documentData.issue_date}</p>
            <p className="text-sm text-gray-500">Due Date: {documentData.due_date}</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <h4 className="text-sm uppercase text-gray-500 mb-2">Description</h4>
          <p>{documentData.description || "Services or goods provided"}</p>
        </div>
        
        {documentData.category && (
          <div className="mb-6">
            <h4 className="text-sm uppercase text-gray-500 mb-2">Category</h4>
            <p>{documentData.category}</p>
          </div>
        )}
        
        {documentData.payment_method && (
          <div className="mb-6">
            <h4 className="text-sm uppercase text-gray-500 mb-2">Payment Method</h4>
            <p>{formatPaymentMethod(documentData.payment_method)}</p>
          </div>
        )}
        
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Item</span>
            <div className="flex">
              <span className="w-16 text-right">Qty</span>
              <span className="w-20 text-right">Price</span>
              <span className="w-24 text-right">Amount</span>
            </div>
          </div>
          
          <div className="border-t border-b py-2">
            <div className="flex justify-between my-2">
              <span>{isInvoice ? "Professional Services" : `${documentData.vendor_or_client} Services`}</span>
              <div className="flex">
                <span className="w-16 text-right">1</span>
                <span className="w-20 text-right">${documentData.amount.toFixed(2)}</span>
                <span className="w-24 text-right">${documentData.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold mr-8">Total:</span>
                <span className="font-bold">${documentData.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <span className="text-blue-500 text-sm font-medium">
            {isInvoice ? "Pay online" : "Pay bill"}
          </span>
        </div>
      </div>
    </div>
  );
}
