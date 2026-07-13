import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Bell, Send } from "lucide-react";

export function Notifications() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Notifications</h1>
        <p className="text-muted-foreground mt-1">Send notifications to users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Notification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipients</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="investors">All Investors</SelectItem>
                  <SelectItem value="brokers">All Brokers</SelectItem>
                  <SelectItem value="kyc-pending">Pending KYC Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="Enter notification subject..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your message..."
                rows={6}
              />
            </div>
            <Button className="w-full gap-2">
              <Send className="h-4 w-4" />
              Send Notification
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { title: "New Property Listed", recipients: "All Investors", time: "2 hours ago" },
                { title: "KYC Verification Update", recipients: "Pending Users", time: "5 hours ago" },
                { title: "Monthly Newsletter", recipients: "All Users", time: "1 day ago" },
                { title: "Commission Payout", recipients: "All Brokers", time: "2 days ago" },
              ].map((notif, i) => (
                <div key={i} className="p-4 bg-accent/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{notif.title}</p>
                      <p className="text-sm text-muted-foreground">To: {notif.recipients}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
