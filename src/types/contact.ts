
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
  logo_url?: string;
  logo?: File | null;
}

export type ContactFormData = Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// Add this optional wallet address to ensure it's included in the contact form data
export interface AddContactFormData {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  type: 'Customer' | 'Vendor' | 'Other';
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  tax_id?: string;
  wallet_address?: string;
  logo?: File | null;
}
