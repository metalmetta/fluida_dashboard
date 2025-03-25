
import { InvoiceFormData } from "@/types/invoice";

interface InvoicePreviewProps {
  form: InvoiceFormData;
  companyName: string;
  companyEmail: string;
  calculateTotal: () => number;
}

export function InvoicePreview({
  form,
  companyName,
  companyEmail,
  calculateTotal
}: InvoicePreviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between mb-8">
        <div>
          <h3 className="font-bold text-xl">{companyName}</h3>
          <p className="text-sm text-gray-500">{companyEmail}</p>
        </div>
        <div className="text-right">
          <h3 className="font-bold text-lg">INVOICE</h3>
          <p className="text-sm text-gray-500">#{form.invoice_number}</p>
        </div>
      </div>
      
      <div className="mb-8">
        <h4 className="font-medium text-gray-500 text-sm mb-2">BILL TO</h4>
        {form.client_name ? (
          <>
            <p className="font-medium">{form.client_name}</p>
            {form.client_email && <p className="text-sm">{form.client_email}</p>}
            {form.client_address && <p className="text-sm">{form.client_address}</p>}
            <p className="text-sm">
              {form.client_city && `${form.client_city}, `}
              {form.client_state && `${form.client_state} `}
              {form.client_zip && form.client_zip}
            </p>
            {form.client_country && <p className="text-sm">{form.client_country}</p>}
          </>
        ) : (
          <p className="text-gray-400 italic">No client selected</p>
        )}
      </div>
      
      <div className="flex justify-between mb-4 text-sm">
        <div>
          <p className="text-gray-500">Issue Date</p>
          <p>{form.issue_date}</p>
        </div>
        <div>
          <p className="text-gray-500">Due Date</p>
          <p>{form.due_date}</p>
        </div>
      </div>
      
      <div className="border-t border-b py-4 my-4">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span className="w-5/12">Description</span>
          <span className="w-2/12 text-center">Qty</span>
          <span className="w-2/12 text-right">Price</span>
          <span className="w-3/12 text-right">Amount</span>
        </div>
        
        {form.items.map((item, index) => (
          <div key={index} className="flex justify-between my-2 text-sm">
            <span className="w-5/12 truncate">{item.description || "Item description"}</span>
            <span className="w-2/12 text-center">{item.quantity}</span>
            <span className="w-2/12 text-right">${item.price.toFixed(2)}</span>
            <span className="w-3/12 text-right">${item.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end">
        <div className="w-1/2">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Total:</span>
            <span className="font-bold">${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {form.payment_method && (
        <div className="mt-6 pt-4 border-t text-sm">
          <h4 className="font-medium text-gray-500 mb-2">PAYMENT METHOD</h4>
          <p>{form.payment_method}</p>
          {form.payment_instructions && <p className="mt-2">{form.payment_instructions}</p>}
        </div>
      )}
      
      {form.terms && (
        <div className="mt-6 pt-4 border-t text-sm">
          <h4 className="font-medium text-gray-500 mb-2">TERMS & CONDITIONS</h4>
          <p>{form.terms}</p>
        </div>
      )}
      
      {form.notes && (
        <div className="mt-6 pt-4 border-t text-sm">
          <h4 className="font-medium text-gray-500 mb-2">NOTES</h4>
          <p>{form.notes}</p>
        </div>
      )}
    </div>
  );
}
