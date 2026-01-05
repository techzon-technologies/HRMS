import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { apiService } from "@/lib/api";

export function DepartmentOverview() {
  const [departments, setDepartments] = useState<{ name: string; employees: number; capacity: number; color: string }[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await apiService.departments.getAll() as any[];
        // Assuming capacity is not in DB yet, random or calculated?
        // Or openPositions + employees = capacity
        const mappedData = data.map((d: any) => ({
          name: d.name,
          employees: d.employees || 0,
          capacity: (d.employees || 0) + (d.openPositions || 0),
          color: d.color || "bg-primary",
        }));
        setDepartments(mappedData);
      } catch (error) {
        console.error("Failed to fetch departments for overview", error);
      }
    };
    fetchDepartments();
  }, []);
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
