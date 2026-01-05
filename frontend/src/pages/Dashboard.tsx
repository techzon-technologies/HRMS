import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { LeaveRequests } from "@/components/dashboard/LeaveRequests";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { DepartmentOverview } from "@/components/dashboard/DepartmentOverview";
import { Users, UserCheck, CalendarOff, Clock } from "lucide-react";
import { apiService } from "@/lib/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    lateArrivals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesRes, attendanceRes, leavesRes] = await Promise.all([
          apiService.employees.getAll(),
          apiService.attendance.getAll(),
          apiService.leaves.getAll(),
        ]);

        const employees = Array.isArray(employeesRes) ? employeesRes : [];
        const attendance = Array.isArray(attendanceRes) ? attendanceRes : [];
        const leaves = Array.isArray(leavesRes) ? (leavesRes as any[]) : [];

        setEmployees(employees);
        setAttendanceData(attendance as any[]);
        setLeaveRequests(leaves as any[]);

        const today = new Date().toISOString().split("T")[0];

        // Calculate stats
        const totalEmployees = employees.length;

        // Filter attendance for today
        const todayAttendance = attendance.filter((record: any) =>
          record.date === today || record.checkIn?.startsWith(today)
        );

        const presentToday = todayAttendance.filter((record: any) =>
          record.status === 'present' || record.status === 'late'
        ).length;

        const lateArrivals = todayAttendance.filter((record: any) =>
          record.status === 'late'
        ).length;

        // Calculate active leaves for today
        const activeLeaves = leaves.filter((leave: any) => {
          return leave.status === 'approved' &&
            leave.startDate <= today &&
            leave.endDate >= today;
        }).length;

        setStats({
          totalEmployees,
          presentToday,
          onLeave: activeLeaves,
          lateArrivals,
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <MainLayout title="Dashboard" subtitle="Welcome back, Admin">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={loading ? "..." : stats.totalEmployees}
          change="+12 this month"
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Present Today"
          value={loading ? "..." : stats.presentToday}
          change={`${stats.totalEmployees > 0 ? Math.round((stats.presentToday / stats.totalEmployees) * 100) : 0}% attendance`}
          changeType="positive"
          icon={UserCheck}
        />
        <StatCard
          title="On Leave"
          value={loading ? "..." : stats.onLeave}
          change={`${stats.onLeave} active today`}
          changeType="neutral"
          icon={CalendarOff}
        />
        <StatCard
          title="Late Arrivals"
          value={loading ? "..." : stats.lateArrivals}
          change="Needs attention"
          changeType={stats.lateArrivals > 0 ? "negative" : "positive"}
          icon={Clock}
        />
      </div>

      {/* Charts Row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AttendanceChart data={attendanceData} />
        <DepartmentOverview />
      </div>

      {/* Activity & Leave Requests */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <LeaveRequests requests={leaveRequests} />
        <RecentActivity employees={employees} leaves={leaveRequests} />
      </div>
    </MainLayout>
  );
};

export default Dashboard;
