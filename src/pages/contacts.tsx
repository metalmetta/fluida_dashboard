
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Mail, Phone, Loader2, MapPin, Building } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContacts } from "@/hooks/useContacts";
import { AddContactDialog } from "@/components/AddContactDialog";

export default function Contacts() {
  const {
    contacts,
    isLoading
  } = useContacts();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || contact.company && contact.company.toLowerCase().includes(searchQuery.toLowerCase()) || contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()) || contact.phone && contact.phone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || contact.type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });
  return <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Contacts</h1>
            <p className="text-muted-foreground"></p>
          </div>
          <div className="flex gap-2">
            <AddContactDialog />
          </div>
        </div>

        <Card className="p-4 sm:p-6">
          <p className="text-sm text-muted-foreground mb-6">To avoid delays when creating transfers for vendors, add their details now. Verification takes up to one day, so starting early keeps you ready to transact.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search contacts..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
            </div>
            <Select defaultValue="all" value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
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

          {isLoading ? <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div> : filteredContacts.length === 0 ? <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">No contacts found</p>
              <p className="text-sm">Try adjusting your search or filter</p>
            </div> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredContacts.map(contact => <div key={contact.id} className="p-4 rounded-lg border hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {contact.logo_url ? <Avatar className="h-10 w-10 border">
                          <img src={contact.logo_url} alt={`${contact.name} logo`} />
                        </Avatar> : <Avatar className="h-10 w-10" />}
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
                    {contact.email && <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                          {contact.email}
                        </a>
                      </div>}
                    {contact.phone && <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                          {contact.phone}
                        </a>
                      </div>}
                    {contact.address && <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{contact.address}</span>
                      </div>}
                    {contact.tax_id && <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>Tax ID: {contact.tax_id}</span>
                      </div>}
                  </div>
                </div>)}
            </div>}
        </Card>
      </div>
    </DashboardLayout>;
}
