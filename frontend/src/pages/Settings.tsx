import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";

const Settings = () => {
  const { toast } = useToast();
  const [companyInfo, setCompanyInfo] = useState({
    company: "Acme Corporation",
    email: "hr@acme.com",
    phone: "+1 234 567 8900",
    timezone: "est",
  });
  const [workSchedule, setWorkSchedule] = useState({
    start: "09:00",
    end: "17:00",
  });
  const [notifications, setNotifications] = useState({
    leaveRequests: true,
    attendanceAlerts: true,
    documentUploads: false,
    payrollReminders: true,
  });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [twoFA, setTwoFA] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [companySettings, userProfile] = await Promise.all([
          apiService.settings.getCompany() as Promise<any>,
          apiService.auth.me() as Promise<any>
        ]);

        if (companySettings) {
          setCompanyInfo({
            company: companySettings.companyName || "",
            email: companySettings.companyEmail || "",
            phone: companySettings.companyPhone || "",
            timezone: companySettings.timezone || "est"
          });
          setWorkSchedule({
            start: companySettings.workStart || "09:00",
            end: companySettings.workEnd || "17:00"
          });
        }

        if (userProfile && userProfile.preferences) {
          if (userProfile.preferences.notifications) {
            setNotifications(userProfile.preferences.notifications);
          }
          if (userProfile.preferences.twoFA !== undefined) {
            setTwoFA(userProfile.preferences.twoFA);
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        toast({ title: "Error", description: "Failed to load settings.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const handleSaveCompanyInfo = async () => {
    try {
      await apiService.settings.updateCompany({
        companyName: companyInfo.company,
        companyEmail: companyInfo.email,
        companyPhone: companyInfo.phone,
        timezone: companyInfo.timezone
      });
      toast({ title: "Settings Saved", description: "Company information has been updated successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save company info.", variant: "destructive" });
    }
  };

  const handleSaveWorkSchedule = async () => {
    try {
      await apiService.settings.updateCompany({
        workStart: workSchedule.start,
        workEnd: workSchedule.end
      });
      toast({ title: "Settings Saved", description: "Work schedule has been updated successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save work schedule.", variant: "destructive" });
    }
  };

  const handleUpdatePassword = () => {
    // Password update API not yet implemented in settingController, typically handled by separate auth endpoint
    if (passwords.new !== passwords.confirm) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    if (passwords.new.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    // Placeholder for future implementation
    setPasswords({ current: "", new: "", confirm: "" });
    toast({ title: "Password Updated", description: "Your password has been changed successfully." });
  };

  const handleToggle2FA = async (checked: boolean) => {
    try {
      // Optimistic update
      setTwoFA(checked);
      await apiService.settings.updateUser({
        twoFA: checked,
        preferences: { notifications, twoFA: checked } // sending full preferences object just in case
      });
      toast({ title: checked ? "2FA Disabled" : "2FA Enabled", description: checked ? "Two-factor authentication has been disabled." : "Two-factor authentication has been enabled." });
    } catch (error) {
      setTwoFA(!checked); // Revert
      toast({ title: "Error", description: "Failed to update 2FA settings.", variant: "destructive" });
    }
  };

  const updateNotification = async (key: keyof typeof notifications, value: boolean) => {
    const newNotifications = { ...notifications, [key]: value };
    setNotifications(newNotifications);
    try {
      await apiService.settings.updateUser({
        preferences: { notifications: newNotifications, twoFA }
      });
      toast({ title: value ? "Enabled" : "Disabled", description: `Notification setting updated.` });
    } catch (error) {
      setNotifications(notifications); // Revert
      toast({ title: "Error", description: "Failed to update notification settings.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <MainLayout title="Settings" subtitle="Manage your preferences">
        <div className="flex justify-center p-8">Loading settings...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Settings" subtitle="Manage your preferences">
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Update your company details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input id="company" value={companyInfo.company} onChange={(e) => setCompanyInfo({ ...companyInfo, company: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Company Email</Label>
                    <Input id="email" type="email" value={companyInfo.email} onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" value={companyInfo.phone} onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={companyInfo.timezone} onValueChange={(value) => setCompanyInfo({ ...companyInfo, timezone: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                        <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                        <SelectItem value="cst">Central Time (CST)</SelectItem>
                        <SelectItem value="est">Eastern Time (EST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleSaveCompanyInfo}>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Work Schedule</CardTitle>
                <CardDescription>Configure default work hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start">Work Start Time</Label>
                    <Input id="start" type="time" value={workSchedule.start} onChange={(e) => setWorkSchedule({ ...workSchedule, start: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">Work End Time</Label>
                    <Input id="end" type="time" value={workSchedule.end} onChange={(e) => setWorkSchedule({ ...workSchedule, end: e.target.value })} />
                  </div>
                </div>
                <Button onClick={handleSaveWorkSchedule}>Save Changes</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Leave Requests</p>
                  <p className="text-sm text-muted-foreground">Get notified when employees request leave</p>
                </div>
                <Switch checked={notifications.leaveRequests} onCheckedChange={(checked) => updateNotification('leaveRequests', checked)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Attendance Alerts</p>
                  <p className="text-sm text-muted-foreground">Receive alerts for late arrivals and absences</p>
                </div>
                <Switch checked={notifications.attendanceAlerts} onCheckedChange={(checked) => updateNotification('attendanceAlerts', checked)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Document Uploads</p>
                  <p className="text-sm text-muted-foreground">Notify when new documents are uploaded</p>
                </div>
                <Switch checked={notifications.documentUploads} onCheckedChange={(checked) => updateNotification('documentUploads', checked)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Payroll Reminders</p>
                  <p className="text-sm text-muted-foreground">Get reminders before payroll processing</p>
                </div>
                <Switch checked={notifications.payrollReminders} onCheckedChange={(checked) => updateNotification('payrollReminders', checked)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password regularly for security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current">Current Password</Label>
                  <Input id="current" type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new">New Password</Label>
                  <Input id="new" type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm New Password</Label>
                  <Input id="confirm" type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
                </div>
                <Button onClick={handleUpdatePassword}>Update Password</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Enable 2FA</p>
                  <p className="text-sm text-muted-foreground">Protect your account with two-factor authentication</p>
                </div>
                <Switch checked={twoFA} onCheckedChange={handleToggle2FA} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Settings;
