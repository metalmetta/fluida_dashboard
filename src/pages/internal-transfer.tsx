import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserBalance } from "@/hooks/useUserBalance";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Wallet, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewTransferDialog from "@/components/NewTransferDialog";

interface InternalTransfer {
  id: string;
  amount: number;
  currency: string;
  from_account: string;
  to_account: string;
  status: string;
  reference: string | null;
  description: string | null;
  transfer_date: string;
  created_at: string;
  updated_at: string;
}

export default function InternalTransfer() {
  const [transfers, setTransfers] = useState<InternalTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const { balance, fetchBalance } = useUserBalance();
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchTransfers = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("internal_transfers")
        .select("*")
        .order("transfer_date", { ascending: false });

      if (error) throw error;
      
      setTransfers(data || []);
    } catch (error) {
      console.error("Error fetching internal transfers:", error);
      toast({
        title: "Error",
        description: "Failed to load internal transfers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferComplete = () => {
    fetchTransfers();
    fetchBalance();
  };

  useEffect(() => {
    if (user) {
      fetchTransfers();
    }
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Internal Transfer</h1>
            <p className="text-muted-foreground">Send funds from your Fluida balance to your bank accounts</p>
          </div>
          <Button variant="default" onClick={() => setTransferDialogOpen(true)}>
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            New Transfer
          </Button>
        </div>

        {balance && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">Available Balance</h3>
              </div>
              <p className="text-2xl font-bold mt-2">
                {formatCurrency(balance.available_amount, balance.currency)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Current available balance to transfer
              </p>
            </Card>
          </div>
        )}

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-6">Transfer History</h3>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : transfers.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-muted/30">
              <p className="text-muted-foreground">No internal transfers found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((transfer) => (
                    <TableRow key={transfer.id} className="hover:bg-muted/50">
                      <TableCell>
                        {new Date(transfer.transfer_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{transfer.from_account}</TableCell>
                      <TableCell>{transfer.to_account}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(transfer.amount, transfer.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transfer.status === "Completed"
                              ? "success"
                              : transfer.status === "Processing"
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {transfer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {transfer.reference || "-"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>

      <NewTransferDialog 
        open={transferDialogOpen} 
        onOpenChange={setTransferDialogOpen} 
        onTransferComplete={handleTransferComplete}
      />
    </DashboardLayout>
  );
}
