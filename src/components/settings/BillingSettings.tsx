
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BillingSettings() {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Payment Method</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Default Payment Method</Label>
              <Select defaultValue="card1">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card1">Visa ending in 4242</SelectItem>
                  <SelectItem value="card2">Mastercard ending in 8888</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">Add Payment Method</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Billing Plan</h3>
          <div className="p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium">Pro Plan</p>
                <p className="text-sm text-muted-foreground">$49/month</p>
              </div>
              <Badge>Current Plan</Badge>
            </div>
            <Button variant="outline" className="w-full">Change Plan</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
