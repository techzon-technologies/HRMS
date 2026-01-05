import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function Profile() {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : { firstName: 'User', lastName: '', role: 'Employee', email: 'user@example.com' };
    const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

    return (
        <MainLayout title="My Profile" subtitle="View and manage your account details">
            <div className="max-w-3xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src="" />
                                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="text-center sm:text-left">
                                <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
                                <p className="text-muted-foreground">{user.role}</p>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">First Name</Label>
                                <p className="font-medium">{user.firstName}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Last Name</Label>
                                <p className="font-medium">{user.lastName}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Email Address</Label>
                                <p className="font-medium">{user.email || "N/A"}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Role</Label>
                                <p className="font-medium">{user.role}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Employee ID</Label>
                                <p className="font-medium">{user.employeeId || "N/A"}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Department</Label>
                                <p className="font-medium">{user.department || "N/A"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
