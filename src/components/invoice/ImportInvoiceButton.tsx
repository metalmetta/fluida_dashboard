
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ImportInvoiceButtonProps {
  onImportComplete: () => void;
}

export function ImportInvoiceButton({ onImportComplete }: ImportInvoiceButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.includes('pdf')) {
      toast({
        title: "Invalid file",
        description: "Please upload a PDF file",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Upload PDF to storage
      const fileName = `${userData.user.id}/${Date.now()}-${file.name}`;
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('invoice_documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('invoice_documents')
        .getPublicUrl(fileName);

      // Process the PDF with OCR
      const { data: ocrData, error: ocrError } = await supabase.functions
        .invoke('process-invoice', {
          body: { fileUrl: publicUrl }
        });

      if (ocrError) throw ocrError;

      // Create invoice with extracted data
      const { error: insertError } = await supabase
        .from('invoices')
        .insert({
          document_url: publicUrl,
          ocr_data: ocrData,
          ...ocrData.invoice_data
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Invoice imported successfully"
      });
      
      onImportComplete();
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Error",
        description: "Failed to import invoice",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Button
      variant="outline"
      disabled={isUploading}
      className="relative"
    >
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isUploading}
      />
      <Upload className="h-4 w-4 mr-2" />
      {isUploading ? "Importing..." : "Import PDF"}
    </Button>
  );
}
