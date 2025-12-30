import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const activities = [
  {
    id: 1,
    user: { name: "Sarah Johnson", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&crop=face", initials: "SJ" },
    action: "submitted a leave request",
    type: "leave",
    time: "2 hours ago",
  },
  {
    id: 2,
    user: { name: "Michael Chen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face", initials: "MC" },
    action: "completed onboarding",
    type: "onboarding",
    time: "4 hours ago",
  },
  {
    id: 3,
    user: { name: "Emily Davis", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face", initials: "ED" },
    action: "updated their profile",
    type: "profile",
    time: "5 hours ago",
  },
  {
    id: 4,
    user: { name: "James Wilson", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face", initials: "JW" },
    action: "requested time off",
    type: "leave",
    time: "Yesterday",
  },
  {
    id: 5,
    user: { name: "Lisa Anderson", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face", initials: "LA" },
    action: "uploaded documents",
    type: "document",
    time: "Yesterday",
  },
];

const badgeVariant = (type: string) => {
  switch (type) {
    case "leave":
      return "default";
    case "onboarding":
      return "secondary";
    case "profile":
      return "outline";
    case "document":
      return "secondary";
    default:
      return "outline";
  }
};

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
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
        ))}
      </CardContent>
    </Card>
  );
}
