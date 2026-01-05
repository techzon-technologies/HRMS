import { useState, useEffect } from "react";
import { Bell, Calendar, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiService } from "@/lib/api";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface Notification {
    id: string;
    title: string;
    description: string;
    time: string;
    type: "leave" | "expiry" | "other";
    link: string;
    priority: "high" | "normal";
}

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Mark as read conceptually when opened, or just keep real-time
        }
    }, [isOpen]);

    useEffect(() => {
        fetchNotifications();
        // Poll every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const [leaves, visas, licences] = await Promise.all([
                apiService.leaves.getAll(),
                apiService.visas.getAll(),
                apiService.drivingLicences.getAll(),
            ]);

            const newNotifications: Notification[] = [];

            // 1. Pending Leave Requests
            const pendingLeaves = (leaves as any[]).filter(l => l.status === 'pending');
            pendingLeaves.forEach(leave => {
                newNotifications.push({
                    id: `leave-${leave.id}`,
                    title: "New Leave Request",
                    description: `${leave.employee?.firstName} requested ${leave.type}`,
                    time: new Date(leave.createdAt || new Date()).toLocaleDateString(),
                    type: "leave",
                    link: "/leave-management",
                    priority: "normal"
                });
            });

            // 2. Visa Expiries (next 30 days)
            const today = new Date();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(today.getDate() + 30);

            (visas as any[]).forEach(visa => {
                const expiryDate = new Date(visa.expiryDate);
                if (expiryDate > today && expiryDate <= thirtyDaysFromNow) {
                    newNotifications.push({
                        id: `visa-${visa.id}`,
                        title: "Visa Expiring Soon",
                        description: `Visa for ${visa.employee?.firstName} expires on ${visa.expiryDate}`,
                        time: "Urgent",
                        type: "expiry",
                        link: "/visa-documents",
                        priority: "high"
                    });
                }
            });

            // 3. Licence Expiries
            (licences as any[]).forEach(lic => {
                const expiryDate = new Date(lic.expiryDate);
                if (expiryDate > today && expiryDate <= thirtyDaysFromNow) {
                    newNotifications.push({
                        id: `lic-${lic.id}`,
                        title: "Licence Expiring Soon",
                        description: `Licence using by ${lic.employee?.firstName} expires on ${lic.expiryDate}`,
                        time: "Urgent",
                        type: "expiry",
                        link: "/driving-licence",
                        priority: "high"
                    });
                }
            });

            setNotifications(newNotifications);
            setUnreadCount(newNotifications.length);

        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between border-b p-4">
                    <h4 className="font-semibold">Notifications</h4>
                    {unreadCount > 0 && <Badge variant="secondary">{unreadCount} New</Badge>}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                            <CheckCircle2 className="mb-2 h-8 w-8 opacity-50" />
                            <p>No new notifications</p>
                        </div>
                    ) : (
                        <div className="grid gap-1">
                            {notifications.map((notification) => (
                                <Link
                                    key={notification.id}
                                    to={notification.link}
                                    className="flex items-start gap-4 border-b p-4 transition-colors hover:bg-muted/50 last:border-0"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className={`mt-1 rounded-full p-2 ${notification.type === 'leave' ? 'bg-blue-100 text-blue-600' :
                                            notification.type === 'expiry' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100'
                                        }`}>
                                        {notification.type === 'leave' ? <Calendar className="h-4 w-4" /> :
                                            notification.type === 'expiry' ? <AlertTriangle className="h-4 w-4" /> :
                                                <FileText className="h-4 w-4" />}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{notification.title}</p>
                                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                                        <p className="text-xs text-muted-foreground pt-1">{notification.time}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
