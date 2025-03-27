import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isStandardizedFormat } from "@/lib/documentUtils";

interface DocumentsTableProps<T> {
  documents: T[];
  isLoading: boolean;
  columns: {
    header: string;
    accessorKey: keyof T;
    cell?: (item: T) => React.ReactNode;
  }[];
  emptyState: {
    title: string;
    description: string;
    buttonText: string;
    onButtonClick: () => void;
  };
  onRowClick: (document: T) => void;
  statusKey: keyof T;
  getStatusVariant: (status: string) => "outline" | "destructive" | "secondary" | "success";
  renderRowActions?: (item: T) => React.ReactNode;
}

export function DocumentsTable<T>({
  documents,
  isLoading,
  columns,
  emptyState,
  onRowClick,
  statusKey,
  getStatusVariant,
  renderRowActions
}: DocumentsTableProps<T>) {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
        <h3 className="mt-2 text-lg font-medium">{emptyState.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {emptyState.description}
        </p>
        <Button onClick={emptyState.onButtonClick} variant="outline" className="mt-4">
          <Plus className="h-4 w-4 mr-2" />
          {emptyState.buttonText}
        </Button>
      </div>
    );
  }

  // Helper function to check if a document has a standardized ID format
  const hasStandardizedFormat = (document: T) => {
    const docNumber = 
      (document as any).invoice_number || 
      (document as any).bill_number || '';
    return isStandardizedFormat(docNumber);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={String(column.accessorKey)}>{column.header}</TableHead>
          ))}
          {renderRowActions && <TableHead className="w-[100px]">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((document) => (
          <TableRow
            key={String((document as any).id)}
            className="cursor-pointer hover:bg-muted/50"
          >
            {columns.map((column) => (
              <TableCell 
                key={String(column.accessorKey)} 
                onClick={() => onRowClick(document)}
              >
                {column.cell ? (
                  column.cell(document)
                ) : column.accessorKey === statusKey ? (
                  <Badge
                    variant={getStatusVariant(String(document[statusKey]))}
                  >
                    {String(document[statusKey])}
                  </Badge>
                ) : ['invoice_number', 'bill_number'].includes(String(column.accessorKey)) ? (
                  <div className="flex items-center">
                    <span>{String(document[column.accessorKey] || "")}</span>
                    {!hasStandardizedFormat(document) && (
                      <Badge className="ml-2 text-xs" variant="outline">Legacy</Badge>
                    )}
                  </div>
                ) : (
                  String(document[column.accessorKey] || "")
                )}
              </TableCell>
            ))}
            {renderRowActions && (
              <TableCell className="p-2 text-right" onClick={(e) => e.stopPropagation()}>
                {renderRowActions(document)}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
