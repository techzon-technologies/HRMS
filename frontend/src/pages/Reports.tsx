import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { Download, FileText, Users, TrendingUp, Calendar } from "lucide-react";

interface DepartmentData {
  name: string;
  employees: number;
}

interface AttendanceTrend {
  month: string;
  rate: number;
}

interface LeaveDistribution {
  name: string;
  value: number;
  color: string;
}

interface PayrollTrend {
  month: string;
  amount: number;
}

interface ExpensesByCategory {
  name: string;
  value: number;
}

interface ComplianceStatus {
  name: string;
  value: number;
}

const Reports = () => {
  const { toast } = useToast();
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [attendanceTrend, setAttendanceTrend] = useState<AttendanceTrend[]>([]);
  const [leaveDistribution, setLeaveDistribution] = useState<LeaveDistribution[]>([]);
  const [payrollTrend, setPayrollTrend] = useState<PayrollTrend[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<ExpensesByCategory[]>([]);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      const [employees, payrolls, attendance] = await Promise.all([
        apiService.employees.getAll(),
        apiService.payrolls.getAll(),
        apiService.attendance.getAll(),
      ]);

      // Process Employees by Department
      const deptMap = new Map<string, number>();
      employees.forEach((emp: any) => {
        const dept = emp.department || "Unknown";
        deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
      });
      const deptData = Array.from(deptMap.entries()).map(([name, employees]) => ({ name, employees }));
      setDepartmentData(deptData);

      // Process Payroll Trend (Sum by Month)
      const payrollMap = new Map<string, number>();
      payrolls.forEach((p: any) => {
        const date = new Date();
        if (p.month) date.setMonth(p.month - 1);
        const monthName = date.toLocaleString('default', { month: 'short' });
        const amount = parseFloat(p.net_salary || p.netSalary || p.salary || 0);
        payrollMap.set(monthName, (payrollMap.get(monthName) || 0) + amount);
      });
      const payrollData = Array.from(payrollMap.entries()).map(([month, amount]) => ({ month, amount: amount / 1000 })); // in 1000s
      setPayrollTrend(payrollData);

      // Process Attendance Rate
      // Simple approximation: Count 'present' / total records per month?
      // Or just global stats for now as 'trend' requires historical data which might be sparse
      // setAttendanceTrend(...); 

      // Remove loading state
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch report data", error);
      setIsLoading(false);
    }
  };

  const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];

  const reportCards = [
    { title: "Employee Report", description: "Complete employee directory with details", icon: Users },
    { title: "Attendance Report", description: "Monthly attendance summary", icon: Calendar },
    { title: "Leave Report", description: "Leave utilization analysis", icon: FileText },
    { title: "Payroll Report", description: "Salary and compensation data", icon: TrendingUp },
  ];

  const handleDownload = (reportName: string) => {
    toast({ title: "Download Started", description: `${reportName} is being generated and will download shortly.` });
  };

  return (
    <MainLayout title="Reports" subtitle="Analytics and insights">
      <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {reportCards.map((report) => (
          <Card key={report.title} className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-accent p-3"><report.icon className="h-6 w-6 text-accent-foreground" /></div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(report.title)}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{report.title}</h3>
              <p className="text-sm text-muted-foreground">{report.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Employees by Department</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} />
                <Bar dataKey="employees" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Leave Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={leaveDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {leaveDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {leaveDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Payroll Trend (AED 1000s)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={payrollTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  formatter={(value) => [`AED ${Number(value).toLocaleString()}K`, 'Amount']}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                />
                <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Expenses by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}K`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Attendance Rate Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis domain={[85, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} />
                <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Compliance Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={complianceStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {complianceStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Reports;