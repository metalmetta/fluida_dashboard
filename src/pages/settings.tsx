import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { User, Building2, CheckSquare, Users, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Company
            </TabsTrigger>
            <TabsTrigger value="approvals" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Approvals
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="p-6">
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20" />
                  <div>
                    <Button variant="outline" className="mb-2">Change Avatar</Button>
                    <p className="text-sm text-muted-foreground">
                      JPG, GIF or PNG. Max size of 800K
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Your email" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="Your phone number" />
                  </div>
                </div>

                <Button>Save Changes</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="company">
            <Card className="p-6">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input id="company-name" placeholder="Company name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax-id">Tax ID</Label>
                      <Input id="tax-id" placeholder="Tax ID number" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="Company address" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="City" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" placeholder="State" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input id="zip" placeholder="ZIP code" />
                    </div>
                  </div>
                </div>
                <Button>Save Company Details</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="approvals">
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
          </TabsContent>

          <TabsContent value="team">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Team Members</h3>
                  <Button>
                    <Users className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4 border-b">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10" />
                      <div>
                        <p className="font-medium">John Doe</p>
                        <p className="text-sm text-muted-foreground">john@example.com</p>
                      </div>
                    </div>
                    <Select defaultValue="admin">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10" />
                      <div>
                        <p className="font-medium">Jane Smith</p>
                        <p className="text-sm text-muted-foreground">jane@example.com</p>
                      </div>
                    </div>
                    <Select defaultValue="member">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 