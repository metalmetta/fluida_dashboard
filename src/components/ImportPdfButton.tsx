
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

interface ImportPdfButtonProps {
  onImportSuccess: (billData: any) => void;
}

export function ImportPdfButton({ onImportSuccess }: ImportPdfButtonProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file",
        variant: "destructive"
      });
      return;
    }

    try {
      // Upload PDF to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bill_documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Call OCR edge function to extract bill details
      const response = await supabase.functions.invoke('ocr-bill-import', {
        body: JSON.stringify({ 
          fileUrl: uploadData.path,
          bucketName: 'bill_documents'
        })
      });

      if (response.error) throw response.error;

      // Process the OCR results
      const ocrData = response.data;
      onImportSuccess(ocrData);

      toast({
        title: "PDF Imported",
        description: "Bill details extracted successfully",
      });

    } catch (error) {
      console.error('PDF Import Error:', error);
      toast({
        title: "Import Failed",
        description: "Unable to process the PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".pdf"
        onChange={handleFileUpload}
      />
      <Button 
        variant="outline" 
        onClick={() => fileInputRef.current?.click()}
      >
        <FileUp className="mr-2 h-4 w-4" />
        Import PDF
      </Button>
    </>
  );
}
