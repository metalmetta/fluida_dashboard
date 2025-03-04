
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, Check, X, File } from "lucide-react";

interface KybDocumentUploadProps {
  documentType: string;
  label: string;
  description: string;
  onUpload: (file: File) => Promise<boolean>;
  uploaded?: boolean;
}

export default function KybDocumentUpload({
  documentType,
  label,
  description,
  onUpload,
  uploaded = false,
}: KybDocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [isSuccess, setIsSuccess] = useState(uploaded);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 300);

    try {
      const success = await onUpload(file);
      
      if (success) {
        setUploadProgress(100);
        setIsSuccess(true);
      } else {
        setError("Upload failed. Please try again.");
        setUploadProgress(0);
      }
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.");
      setUploadProgress(0);
    } finally {
      clearInterval(interval);
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setIsSuccess(false);
    setError(null);
    setUploadProgress(0);
  };

  return (
    <div className="p-6 border rounded-md bg-white">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-lg">{label}</h3>
          <p className="text-gray-500 text-sm mt-1">{description}</p>
        </div>
        {isSuccess && (
          <div className="flex items-center text-green-600">
            <Check className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">Uploaded</span>
          </div>
        )}
      </div>

      {!isSuccess ? (
        <div className="mt-4">
          <input
            type="file"
            id={`file-${documentType}`}
            className="sr-only"
            onChange={handleFileSelect}
            disabled={isUploading}
            accept=".pdf,.png,.jpg,.jpeg"
          />
          
          {file ? (
            <div className="mt-2">
              <div className="flex items-center p-2 border rounded bg-gray-50">
                <File className="text-blue-500 mr-2" size={20} />
                <span className="text-sm truncate flex-1">{file.name}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleReset}
                  disabled={isUploading}
                >
                  <X size={16} />
                </Button>
              </div>
              
              {isUploading && (
                <div className="mt-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-center mt-1">Uploading... {uploadProgress}%</p>
                </div>
              )}
              
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
              
              <div className="mt-4">
                <Button 
                  onClick={handleUpload} 
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? "Uploading..." : "Upload Document"}
                </Button>
              </div>
            </div>
          ) : (
            <Label
              htmlFor={`file-${documentType}`}
              className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50"
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="mt-2 text-sm text-gray-500">Click to upload</span>
              <span className="mt-1 text-xs text-gray-400">PDF, PNG, JPG (Max 10MB)</span>
            </Label>
          )}
        </div>
      ) : (
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleReset}
          >
            Replace Document
          </Button>
        </div>
      )}
    </div>
  );
}
