
/**
 * Utility functions for bill management
 */

/**
 * Generates a formatted bill ID based on the specified pattern:
 * BL-{YYYY}{MM}-{VendorCode}-{Invoice#}
 * 
 * @param issueDate - The issue date of the bill
 * @param vendor - The vendor name
 * @param invoiceNumber - The original invoice number
 * @returns Formatted bill ID string
 */
export function generateBillId(issueDate: Date, vendor: string, invoiceNumber: string): string {
  // Format year and month (YYYYMM)
  const year = issueDate.getFullYear();
  const month = String(issueDate.getMonth() + 1).padStart(2, '0');
  const dateCode = `${year}${month}`;
  
  // Generate vendor code (first 3-5 characters, uppercase, no spaces)
  const vendorCode = vendor
    .replace(/\s+/g, '') // Remove spaces
    .slice(0, 5) // Take first 5 characters max
    .toUpperCase();
  
  // Clean invoice number (remove spaces and special characters)
  const cleanInvoiceNumber = invoiceNumber
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '');
  
  // Format the bill ID
  return `BL-${dateCode}-${vendorCode}-${cleanInvoiceNumber}`;
}
