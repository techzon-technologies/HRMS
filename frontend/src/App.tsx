import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Employees from "./pages/Employees";
import Departments from "./pages/Departments";
import LeaveManagement from "./pages/LeaveManagement";
import Attendance from "./pages/Attendance";
import Documents from "./pages/Documents";
import Payroll from "./pages/Payroll";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import VisaDocuments from "./pages/VisaDocuments";
import DrivingLicence from "./pages/DrivingLicence";
import VehicleManagement from "./pages/VehicleManagement";
import BenefitsGratuity from "./pages/BenefitsGratuity";
import PayrollWPS from "./pages/PayrollWPS";
import Disciplinary from "./pages/Disciplinary";
import HealthInsurance from "./pages/HealthInsurance";
import ComplianceAudit from "./pages/ComplianceAudit";
import Performance from "./pages/Performance";
import CompanyExpenses from "./pages/CompanyExpenses";
import CompanyAssets from "./pages/CompanyAssets";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
          <Route path="/departments" element={<ProtectedRoute><Departments /></ProtectedRoute>} />
          <Route path="/leave" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
          <Route path="/payroll" element={<ProtectedRoute><Payroll /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/visa-documents" element={<ProtectedRoute><VisaDocuments /></ProtectedRoute>} />
          <Route path="/driving-licence" element={<ProtectedRoute><DrivingLicence /></ProtectedRoute>} />
          <Route path="/vehicles" element={<ProtectedRoute><VehicleManagement /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><CompanyExpenses /></ProtectedRoute>} />
          <Route path="/assets" element={<ProtectedRoute><CompanyAssets /></ProtectedRoute>} />
          <Route path="/benefits" element={<ProtectedRoute><BenefitsGratuity /></ProtectedRoute>} />
          <Route path="/payroll-wps" element={<ProtectedRoute><PayrollWPS /></ProtectedRoute>} />
          <Route path="/disciplinary" element={<ProtectedRoute><Disciplinary /></ProtectedRoute>} />
          <Route path="/health-insurance" element={<ProtectedRoute><HealthInsurance /></ProtectedRoute>} />
          <Route path="/compliance" element={<ProtectedRoute><ComplianceAudit /></ProtectedRoute>} />
          <Route path="/performance" element={<ProtectedRoute><Performance /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
