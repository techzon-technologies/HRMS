import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data: { day: string; present: number; absent: number; late: number }[] = [];

export function AttendanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Weekly Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="day" className="text-sm" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis className="text-sm" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar dataKey="present" name="Present" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="late" name="Late" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="absent" name="Absent" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
