import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const activities: {
  id: number;
  user: { name: string; avatar: string; initials: string };
  action: string;
  type: string;
  time: string;
}[] = [];

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
