import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AttendanceChartProps {
  data: any[];
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  // Process data for the last 7 days
  const processChartData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      const dayRecords = data.filter((record: any) =>
        record.date === dateStr || record.checkIn?.startsWith(dateStr)
      );

      last7Days.push({
        day: dayName,
        present: dayRecords.filter((r: any) => r.status === 'present').length,
        late: dayRecords.filter((r: any) => r.status === 'late').length,
        absent: dayRecords.filter((r: any) => r.status === 'absent').length,
      });
    }
    return last7Days;
  };

  const chartData = processChartData();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Weekly Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="day" className="text-sm" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis className="text-sm" tick={{ fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
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
