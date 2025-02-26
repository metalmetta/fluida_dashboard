
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Search, Plus } from "lucide-react";

const vendors = [
  {
    id: "V1",
    name: "Acme Corporation",
    email: "billing@acme.com",
    status: "Active",
    lastPayment: "Feb 15, 2024",
  },
  {
    id: "V2",
    name: "Tech Solutions Inc",
    email: "accounts@techsolutions.com",
    status: "Active",
    lastPayment: "Feb 10, 2024",
  },
  {
    id: "V3",
    name: "Global Services Ltd",
    email: "finance@globalservices.com",
    status: "Active",
    lastPayment: "Feb 5, 2024",
  },
];

export default function Vendors() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Vendors</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
        </div>

        <Card>
          <div className="p-6 space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                className="pl-9"
              />
            </div>

            <div className="divide-y">
              {vendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-4">
                    <Avatar />
                    <div>
                      <p className="font-medium">{vendor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {vendor.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last payment: {vendor.lastPayment}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
