
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
  // Additional fields for the expanded contact form
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  tax_id?: string;
  wallet_address?: string;
}

export type ContactFormData = Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
