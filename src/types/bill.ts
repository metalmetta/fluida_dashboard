
export interface Bill {
  id: string;
  user_id: string;
  vendor: string;
  amount: number;
  due_date: string;
  status: 'Draft' | 'Ready for payment' | 'Paid' | 'Approve';
  category?: string;
  description?: string;
  bill_number: string; // Format: BL-YYYYMM-SupplierCode-Sequence
  issue_date: string;
  created_at: string;
  updated_at: string;
  currency: string;
}

export type BillFormData = Omit<Bill, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// Interface for generating standardized bill numbers
export interface BillNumberParams {
  issueDate: Date;
  supplierName: string;
  sequence?: number;
  prefix?: string;
}
