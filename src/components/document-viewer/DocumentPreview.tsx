import React from "react";
import { formatCurrency } from "@/lib/utils";

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
    currency?: string;
    description?: string;
    category?: string;
    payment_method?: string;
    payment_method_details?: {
      label?: string;
      type?: string;
      iban?: string;
      accountNumber?: string;
      bank_name?: string;
      solanaAddress?: string;
    };
  };
}

export function DocumentPreview({ documentType, documentData }: DocumentPreviewProps) {
  const isInvoice = documentType === "invoice";
  const entityLabel = isInvoice ? "Client" : "Vendor";
  const documentLabel = isInvoice ? "INVOICE" : "BILL";
  
  const formatPaymentMethodDetails = () => {
    if (!documentData.payment_method || !documentData.payment_method_details) return "";
    
    const details = [];
    
    if (documentData.payment_method_details.label) {
      details.push(`${documentData.payment_method_details.label}`);
    }
    
    if (documentData.payment_method === "blockchain_transfer" && documentData.payment_method_details.solanaAddress) {
      details.push(`Solana Wallet: ${documentData.payment_method_details.solanaAddress}`);
    }
    
    if (documentData.payment_method === "bank_transfer") {
      if (documentData.payment_method_details.bank_name) {
        details.push(`Bank: ${documentData.payment_method_details.bank_name}`);
      }
      if (documentData.payment_method_details.iban) {
        details.push(`IBAN: ${documentData.payment_method_details.iban}`);
      } else if (documentData.payment_method_details.accountNumber) {
        details.push(`Account: ${documentData.payment_method_details.accountNumber}`);
      }
    }
    
    return details.join("\n");
  };
  
  const currency = documentData.currency || "USD";
  
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
            <p className="whitespace-pre-line font-medium">{formatPaymentMethodDetails()}</p>
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
                <span className="w-20 text-right">{formatCurrency(documentData.amount, currency)}</span>
                <span className="w-24 text-right">{formatCurrency(documentData.amount, currency)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold mr-8">Total:</span>
                <span className="font-bold">{formatCurrency(documentData.amount, currency)}</span>
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
