export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  client_name: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  payment_method?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  currency: string;
}

export interface InvoiceFormData {
  client_name: string;
  client_email: string;
  client_address?: string;
  client_city?: string;
  client_state?: string;
  client_zip?: string;
  client_country?: string;
  client_tax_id?: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  items: {
    description: string;
    quantity: number;
    price: number;
    amount: number;
  }[];
  notes?: string;
  payment_method?: string;
  payment_method_details?: {
    label?: string;
    type?: string;
    iban?: string;
    accountNumber?: string;
    bank_name?: string;
    solanaAddress?: string;
  };
  payment_instructions?: string;
  terms?: string;
}

export type InvoiceFormStep = 'customer' | 'items' | 'payment';

export interface PaymentMethod {
  id: string;
  type: 'usd' | 'eur' | 'gbp' | 'usdc';
  label: string;
  details: {
    [key: string]: string;
  };
  isDefault: boolean;
}

export interface InvoiceNumberParams {
  issueDate: Date;
  customerName: string;
  invoiceNumber: string;
}
