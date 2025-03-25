
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
}
