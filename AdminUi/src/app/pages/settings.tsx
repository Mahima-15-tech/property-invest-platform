import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import React from "react";

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure platform settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform-name">Platform Name</Label>
                <Input id="platform-name" defaultValue="RealEstateHub" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input id="support-email" type="email" defaultValue="support@realestatehub.com" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Put the platform in maintenance mode</p>
                </div>
                <Switch id="maintenance" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stripe-key">Stripe API Key</Label>
                <Input id="stripe-key" type="password" placeholder="sk_live_..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-investment">Minimum Investment ($)</Label>
                <Input id="min-investment" type="number" defaultValue="1000" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-withdraw">Auto Withdrawal</Label>
                  <p className="text-sm text-muted-foreground">Enable automatic withdrawal processing</p>
                </div>
                <Switch id="auto-withdraw" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commission" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Commission Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="broker-commission">Broker Commission (%)</Label>
                <Input id="broker-commission" type="number" defaultValue="15" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform-fee">Platform Fee (%)</Label>
                <Input id="platform-fee" type="number" defaultValue="2.5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="referral-bonus">Referral Bonus (%)</Label>
                <Input id="referral-bonus" type="number" defaultValue="1" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {["Create Properties", "Approve KYC", "Process Payouts", "Manage Users", "View Reports"].map((permission) => (
                <div key={permission} className="flex items-center justify-between py-2">
                  <Label htmlFor={permission}>{permission}</Label>
                  <Switch id={permission} defaultChecked />
                </div>
              ))}
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
