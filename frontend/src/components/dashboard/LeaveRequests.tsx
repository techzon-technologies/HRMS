import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

const leaveRequests: {
  id: number;
  employee: {
    name: string;
    avatar: string;
    initials: string;
    department: string;
  };
  type: string;
  dates: string;
  days: number;
}[] = [];

export function LeaveRequests() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Pending Leave Requests</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {leaveRequests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between rounded-lg border border-border p-4"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={request.employee.avatar} />
                <AvatarFallback>{request.employee.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{request.employee.name}</p>
                <p className="text-sm text-muted-foreground">
                  {request.type} • {request.dates} ({request.days} day{request.days > 1 ? "s" : ""})
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-primary hover:bg-primary/10">
                <Check className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
