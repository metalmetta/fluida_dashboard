
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ApprovalSettings() {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Approval Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require approval for payments</Label>
                <p className="text-sm text-muted-foreground">
                  All payments will need approval from an authorized user
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-factor approval</Label>
                <p className="text-sm text-muted-foreground">
                  Require two different users to approve payments
                </p>
              </div>
              <Switch />
            </div>
            <div className="space-y-2">
              <Label>Approval Threshold</Label>
              <Select defaultValue="1000">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500">$500</SelectItem>
                  <SelectItem value="1000">$1,000</SelectItem>
                  <SelectItem value="5000">$5,000</SelectItem>
                  <SelectItem value="10000">$10,000</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Payments above this amount require approval
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
