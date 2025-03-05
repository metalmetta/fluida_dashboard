
export interface BusinessDetails {
  companyName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  phone?: string;
  email: string;
  taxId?: string;
}

export interface ColumnEntity {
  id: string;
  type: string;
  name: string;
  business: {
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    structure: string;
    phone: string;
    email: string;
    taxId: string;
  };
}

export interface ColumnBankAccount {
  id: string;
  entityId: string;
  name: string;
  status: string;
  routingNumber: string;
  accountNumber: string;
}
