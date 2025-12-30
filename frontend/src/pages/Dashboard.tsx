import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { LeaveRequests } from "@/components/dashboard/LeaveRequests";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { DepartmentOverview } from "@/components/dashboard/DepartmentOverview";
import { Users, UserCheck, CalendarOff, Clock } from "lucide-react";

const Dashboard = () => {
  return (
    <MainLayout title="Dashboard" subtitle="Welcome back, John">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={156}
          change="+12 this month"
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Present Today"
          value={142}
          change="91% attendance"
          changeType="positive"
          icon={UserCheck}
        />
        <StatCard
          title="On Leave"
          value={8}
          change="5 pending requests"
          changeType="neutral"
          icon={CalendarOff}
        />
        <StatCard
          title="Late Arrivals"
          value={6}
          change="-2 from yesterday"
          changeType="positive"
          icon={Clock}
        />
      </div>

      {/* Charts Row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AttendanceChart />
        <DepartmentOverview />
      </div>

      {/* Activity & Leave Requests */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <LeaveRequests />
        <RecentActivity />
      </div>
    </MainLayout>
  );
};

export default Dashboard;
