
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Mail, Phone, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContacts } from "@/hooks/useContacts";
import { AddContactDialog } from "@/components/AddContactDialog";

export default function Contacts() {
  const { contacts, isLoading, addSampleContacts } = useContacts();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Filter contacts based on search query and type filter
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.company && contact.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (contact.phone && contact.phone.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = typeFilter === "all" || contact.type.toLowerCase() === typeFilter.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Contacts</h1>
            <p className="text-muted-foreground">Manage your business contacts</p>
          </div>
          <div className="flex gap-2">
            {contacts.length === 0 && (
              <Button variant="outline" onClick={addSampleContacts}>
                Add Sample Contacts
              </Button>
            )}
            <AddContactDialog />
          </div>
        </div>

        <Card className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select 
              defaultValue="all" 
              value={typeFilter}
              onValueChange={setTypeFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Contacts</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="vendor">Vendors</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">No contacts found</p>
              {contacts.length === 0 ? (
                <Button onClick={addSampleContacts}>Add Sample Contacts</Button>
              ) : (
                <p className="text-sm">Try adjusting your search or filter</p>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-4 rounded-lg border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar />
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {contact.company || "No company"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{contact.type}</Badge>
                  </div>
                  <div className="space-y-2">
                    {contact.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-primary hover:underline"
                        >
                          {contact.email}
                        </a>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-primary hover:underline"
                        >
                          {contact.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
