
import { InvoiceNumberParams, BillNumberParams } from "@/types";

/**
 * Generates a standardized invoice number in the format: FL-YYYYMM-CustomerCode-Sequence
 */
export function generateInvoiceNumber({
  issueDate,
  customerName,
  sequence = 1,
  prefix = 'FL'
}: InvoiceNumberParams): string {
  // Format date as YYYYMM
  const dateFormat = `${issueDate.getFullYear()}${String(issueDate.getMonth() + 1).padStart(2, '0')}`;
  
  // Generate customer code (3-5 chars from company name)
  const customerCode = generateEntityCode(customerName);
  
  // Format sequence as 3-digit number
  const sequenceStr = String(sequence).padStart(3, '0');
  
  return `${prefix}-${dateFormat}-${customerCode}-${sequenceStr}`;
}

/**
 * Generates a standardized bill number in the format: BL-YYYYMM-SupplierCode-Sequence
 */
export function generateBillNumber({
  issueDate,
  supplierName,
  sequence = 1,
  prefix = 'BL'
}: BillNumberParams): string {
  // Format date as YYYYMM
  const dateFormat = `${issueDate.getFullYear()}${String(issueDate.getMonth() + 1).padStart(2, '0')}`;
  
  // Generate supplier code (3-5 chars from supplier name)
  const supplierCode = generateEntityCode(supplierName);
  
  // Format sequence as 3-digit number
  const sequenceStr = String(sequence).padStart(3, '0');
  
  return `${prefix}-${dateFormat}-${supplierCode}-${sequenceStr}`;
}

/**
 * Extracts a code from an entity name (first 3-5 letters)
 */
function generateEntityCode(name: string): string {
  // Clean the name: remove spaces, special chars, convert to uppercase
  const cleanName = name
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
  
  // Take first 3-5 characters (preferably 4)
  return cleanName.substring(0, Math.min(4, cleanName.length));
}

/**
 * Parses a document number to extract its components
 */
export function parseDocumentNumber(docNumber: string): {
  prefix: string;
  date: string;
  entityCode: string;
  sequence: number;
} | null {
  // Match pattern like FL-YYYYMM-CODE-123
  const pattern = /^([A-Z]+)-(\d{6})-([A-Z0-9]+)-(\d{3})$/;
  const match = docNumber.match(pattern);
  
  if (!match) return null;
  
  return {
    prefix: match[1],
    date: match[2],
    entityCode: match[3],
    sequence: parseInt(match[4], 10)
  };
}

/**
 * Checks if a document number follows the standardized format
 */
export function isStandardizedFormat(docNumber: string): boolean {
  return parseDocumentNumber(docNumber) !== null;
}

/**
 * Gets the next sequence number for a given entity in a given month
 */
export function getNextSequence(documents: { invoice_number?: string; bill_number?: string }[], 
                               prefix: string, 
                               yearMonth: string, 
                               entityCode: string): number {
  let maxSequence = 0;
  
  documents.forEach(doc => {
    const docNumber = doc.invoice_number || doc.bill_number;
    if (!docNumber) return;
    
    const parsed = parseDocumentNumber(docNumber);
    if (parsed && 
        parsed.prefix === prefix && 
        parsed.date === yearMonth && 
        parsed.entityCode === entityCode) {
      maxSequence = Math.max(maxSequence, parsed.sequence);
    }
  });
  
  return maxSequence + 1;
}
