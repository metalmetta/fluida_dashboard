
export interface Bill {
  id: string;
  user_id: string;
  vendor: string;
  amount: number;
  due_date: string;
  status: 'Draft' | 'Ready for payment' | 'Paid' | 'Approve';
  category?: string;
  description?: string;
  bill_number: string;
  issue_date: string;
  created_at: string;
  updated_at: string;
  currency: string;
}

export type BillFormData = Omit<Bill, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// Add a type for bill number generation
export interface BillNumberParams {
  issueDate: Date;
  vendor: string;
  invoiceNumber: string;
}
