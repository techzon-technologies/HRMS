import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const departments = [
  { name: "Engineering", employees: 42, capacity: 50, color: "bg-primary" },
  { name: "Marketing", employees: 28, capacity: 35, color: "bg-chart-2" },
  { name: "Sales", employees: 35, capacity: 40, color: "bg-chart-3" },
  { name: "Human Resources", employees: 12, capacity: 15, color: "bg-chart-4" },
  { name: "Finance", employees: 18, capacity: 20, color: "bg-chart-5" },
];

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
