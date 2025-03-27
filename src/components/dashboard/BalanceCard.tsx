
import { useState } from "react";
import { Line, LineChart, XAxis, YAxis, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, CalendarDays, Clock, Loader2 } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";
import { useBalanceSnapshots } from "@/hooks/useBalanceSnapshots";

type TimeScale = 'day' | 'week' | 'month';

interface BalanceCardProps {
  isLoading: boolean;
  balance: {
    available_amount: number;
    currency: string;
  } | null;
  balanceData: any[];
  timeScale: TimeScale;
  setTimeScale: (value: TimeScale) => void;
  onDepositClick: () => void;
  onWithdrawClick: () => void;
}

export function BalanceCard({
  isLoading,
  balance,
  balanceData,
  timeScale,
  setTimeScale,
  onDepositClick,
  onWithdrawClick
}: BalanceCardProps) {
  const { snapshots, isLoading: snapshotsLoading } = useBalanceSnapshots(timeScale);
  
  // Format snapshot dates based on time scale
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    
    if (timeScale === 'day') {
      // For day view, show hours
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (timeScale === 'week') {
      // For week, show day and month
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      // For month, show only day and month
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };
  
  // Prepare chart data from snapshots
  const chartData = snapshots.map(snapshot => ({
    date: formatDate(snapshot.snapshot_date),
    balance: snapshot.amount
  }));
  
  // Use balance snapshots if available, otherwise fall back to balanceData
  const displayData = chartData.length > 0 ? chartData : balanceData;
  const isChartLoading = isLoading || snapshotsLoading;

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-medium">Balance</h3>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={onDepositClick}
            >
              <ArrowDown className="mr-1 h-4 w-4" />
              Deposit
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={onWithdrawClick}
              disabled={!balance || balance.available_amount <= 0}
            >
              <ArrowUp className="mr-1 h-4 w-4" />
              Withdraw
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
          </div>
        ) : (
          <>
            <div className="flex items-end gap-2 mb-6">
              <p className="text-3xl font-semibold">
                {balance 
                  ? formatCurrency(balance.available_amount, balance.currency)
                  : "$0.00"
                }
              </p>
              <p className="text-sm text-muted-foreground mb-1">Available balance</p>
            </div>
            
            <div className="flex justify-end mb-4">
              <ToggleGroup 
                type="single" 
                value={timeScale}
                onValueChange={(value) => {
                  if (value) setTimeScale(value as TimeScale);
                }}
                className="border rounded-md bg-background p-1"
              >
                <ToggleGroupItem value="day" className="text-xs px-3 py-1 rounded-sm flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Day
                </ToggleGroupItem>
                <ToggleGroupItem value="week" className="text-xs px-3 py-1 rounded-sm flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  Week
                </ToggleGroupItem>
                <ToggleGroupItem value="month" className="text-xs px-3 py-1 rounded-sm flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  Month
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            
            <div className="h-[200px] w-full">
              <ChartContainer
                config={{
                  balance: {
                    label: "Balance",
                    theme: {
                      light: "hsl(var(--primary))",
                      dark: "hsl(var(--primary))"
                    }
                  }
                }}
              >
                {isChartLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary/70" />
                  </div>
                ) : displayData.length > 0 ? (
                  <LineChart data={displayData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <XAxis 
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                      tickMargin={8}
                    />
                    <YAxis 
                      hide={true}
                      domain={['dataMin - 1000', 'dataMax + 1000']}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border border-border bg-card p-2 shadow-md">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Date
                                  </span>
                                  <span className="font-bold text-xs">
                                    {payload[0].payload.date}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Balance
                                  </span>
                                  <span className="font-bold text-xs">
                                    {formatCurrency(
                                      payload[0].value as number,
                                      balance?.currency || "USD"
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      name="balance"
                      stroke="var(--color-balance)"
                      strokeWidth={2.5}
                      activeDot={{
                        r: 6,
                        strokeWidth: 0,
                        fill: "var(--color-balance)"
                      }}
                      dot={{
                        r: 0,
                        strokeWidth: 0
                      }}
                    />
                  </LineChart>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-muted-foreground">No balance history data available</p>
                  </div>
                )}
              </ChartContainer>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
