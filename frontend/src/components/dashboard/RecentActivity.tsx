import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface RecentActivityProps {
  employees: any[];
  leaves: any[];
}

export function RecentActivity({ employees, leaves }: RecentActivityProps) {
  // Synthesize activities from different sources
  const getActivities = () => {
    const activities = [];

    // New employees
    employees.forEach(emp => {
      if (emp.createdAt) {
        activities.push({
          id: `emp-${emp.id}`,
          user: {
            name: `${emp.firstName} ${emp.lastName}`,
            initials: `${emp.firstName[0]}${emp.lastName[0]}`,
            avatar: ''
          },
          action: 'Joined the company',
          type: 'onboarding',
          time: new Date(emp.createdAt),
          timestamp: new Date(emp.createdAt).getTime()
        });
      }
    });

    // Leave requests
    leaves.forEach(leave => {
      activities.push({
        id: `leave-${leave.id}`,
        user: {
          name: leave.employee ? `${leave.employee.firstName} ${leave.employee.lastName}` : 'Unknown',
          initials: leave.employee ? `${leave.employee.firstName[0]}${leave.employee.lastName[0]}` : 'UK',
          avatar: ''
        },
        action: `Requested ${leave.type}`,
        type: 'leave',
        time: new Date(leave.createdAt || new Date()), // Fallback if createdAt missing
        timestamp: new Date(leave.createdAt || new Date()).getTime()
      });
    });

    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5)
      .map(a => ({
        ...a,
        time: formatTimeAgo(a.time)
      }));
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";

    return "just now";
  };

  const activities = getActivities();

  const badgeVariant = (type: string) => {
    switch (type) {
      case "leave": return "default";
      case "onboarding": return "secondary";
      case "profile": return "outline";
      default: return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={activity.user.avatar} />
                <AvatarFallback>{activity.user.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.user.name}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {activity.action}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={badgeVariant(activity.type)}>{activity.type}</Badge>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
