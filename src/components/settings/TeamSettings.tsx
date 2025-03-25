
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TeamSettings() {
  return (
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
  );
}
