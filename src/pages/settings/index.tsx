
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Settings</h1>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-medium">Company Information</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Update your company details and preferences.
            </p>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" defaultValue="Acme Inc" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="billing@acme.com" />
              </div>
              <Button>Save Changes</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-medium">Notifications</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your notification preferences.
            </p>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about new invoices and payments.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about payment status changes.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
