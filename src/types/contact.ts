
export interface Contact {
  id: string;
  user_id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  type: 'Customer' | 'Vendor' | 'Other';
  created_at: string;
  updated_at: string;
}
