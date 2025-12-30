import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const departments: { name: string; employees: number; capacity: number; color: string }[] = [];

export function DepartmentOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Department Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {departments.map((dept) => (
          <div key={dept.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{dept.name}</span>
              <span className="text-muted-foreground">
                {dept.employees}/{dept.capacity} employees
              </span>
            </div>
            <Progress
              value={(dept.employees / dept.capacity) * 100}
              className="h-2"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
