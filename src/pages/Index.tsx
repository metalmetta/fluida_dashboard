import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ArrowUpRight, Building2 } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, XAxis } from "recharts";
import { useAuth } from "@/contexts/AuthContext";

const data = [
  { day: "Jan 13", value: 245000 },
  { day: "Jan 14", value: 873000 },
  { day: "Jan 15", value: 567000 },
  { day: "Jan 16", value: 912000 },
  { day: "Jan 17", value: 156000 },
  { day: "Jan 18", value: 789000 },
  { day: "Jan 19", value: 345000 },
  { day: "Jan 20", value: 678000 },
  { day: "Jan 21", value: 923000 },
  { day: "Jan 22", value: 432000 },
  { day: "Jan 23", value: 867000 },
];

const actions = [
  {
    type: "Contractor Payout",
    amount: "244.00 USDC",
    status: "2/2 approved",
    icon: ArrowUpRight,
  },
  {
    type: "Withdraw to Bank",
    amount: "1,500.00 USDC",
    status: "0/2 approved",
    icon: Building2,
  },
];

const Index = () => {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || "there";

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Welcome back, {userName}</h1>
            <p className="text-muted-foreground">Here's your financial overview</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Balance</h3>
            <p className="text-3xl font-semibold mb-6">$867,000</p>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis dataKey="day" hide />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Pending Actions</h3>
            <div className="space-y-4">
              {actions.map((action, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-primary/10">
                      <action.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{action.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {action.amount}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={action.status.includes("2/2") ? "success" : "outline"}
                  >
                    {action.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar />
                  <div>
                    <p className="font-medium">Vendor Payment</p>
                    <p className="text-sm text-muted-foreground">
                      Transaction ID: 0xb2...97j6
                    </p>
                  </div>
                </div>
                <p className="font-medium">-$1,200.00</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Index;
