import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DollarSign, TrendingUp, Users, Calendar, Search, Download, Eye, Edit, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SalaryRecord {
  id: number;
  employee: {
    name: string;
    avatar: string;
    initials: string;
    position: string;
  };
  baseSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  status: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);
};

const Payroll = () => {
  const { toast } = useToast();
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SalaryRecord | null>(null);
  const [formData, setFormData] = useState({ baseSalary: 0, bonus: 0, deductions: 0 });

  const filteredRecords = salaryRecords.filter((record) =>
    record.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.employee.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPayroll = salaryRecords.reduce((sum, r) => sum + r.netSalary, 0);
  const payrollStats = [
    { label: "Total Payroll", value: formatCurrency(totalPayroll), icon: DollarSign, change: "+5.2%", changeType: "positive" },
    { label: "Average Salary", value: formatCurrency(Math.round(totalPayroll / salaryRecords.length)), icon: TrendingUp, change: "+2.1%", changeType: "positive" },
    { label: "Employees Paid", value: salaryRecords.filter(r => r.status === "paid").length.toString(), icon: Users, change: "0", changeType: "neutral" },
    { label: "Next Payroll", value: "Dec 31", icon: Calendar, change: "5 days", changeType: "neutral" },
  ];

  const handleExport = () => {
    toast({ title: "Export Started", description: "Payroll report is being generated and will download shortly." });
  };

  const handleProcessPayroll = () => {
    setSalaryRecords(salaryRecords.map((r) => ({ ...r, status: "paid" })));
    toast({ title: "Payroll Processed", description: "All pending payroll entries have been processed." });
  };

  const handleEdit = () => {
    if (!selectedRecord) return;
    const netSalary = formData.baseSalary + formData.bonus - formData.deductions;
    setSalaryRecords(salaryRecords.map((r) => r.id === selectedRecord.id ? { ...r, ...formData, netSalary } : r));
    setIsEditDialogOpen(false);
    toast({ title: "Salary Updated", description: "Salary record has been updated successfully." });
  };

  const handleMarkAsPaid = (id: number) => {
    setSalaryRecords(salaryRecords.map((r) => r.id === id ? { ...r, status: "paid" } : r));
    toast({ title: "Payment Processed", description: "Salary has been marked as paid." });
  };

  const openViewDialog = (record: SalaryRecord) => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (record: SalaryRecord) => {
    setSelectedRecord(record);
    setFormData({ baseSalary: record.baseSalary, bonus: record.bonus, deductions: record.deductions });
    setIsEditDialogOpen(true);
  };

  return (
    <MainLayout title="Payroll" subtitle="Manage employee compensation">
      {/* Stats */}
      <div className="mb-6 grid gap-6 md:grid-cols-4">
        {payrollStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-accent p-3">
                <stat.icon className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className={`text-sm ${stat.changeType === "positive" ? "text-primary" : stat.changeType === "negative" ? "text-destructive" : "text-muted-foreground"}`}>{stat.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Salary Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>December 2024 Payroll</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search employees..." className="w-64 pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4" />Export</Button>
            <Button onClick={handleProcessPayroll}>Process Payroll</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">Base Salary</TableHead>
                <TableHead className="text-right">Bonus</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={record.employee.avatar} />
                        <AvatarFallback>{record.employee.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{record.employee.name}</p>
                        <p className="text-sm text-muted-foreground">{record.employee.position}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatCurrency(record.baseSalary)}</TableCell>
                  <TableCell className="text-right text-primary">+{formatCurrency(record.bonus)}</TableCell>
                  <TableCell className="text-right text-destructive">-{formatCurrency(record.deductions)}</TableCell>
                  <TableCell className="text-right font-semibold text-foreground">{formatCurrency(record.netSalary)}</TableCell>
                  <TableCell>
                    <Badge variant={record.status === "paid" ? "default" : "secondary"}>{record.status === "paid" ? "Paid" : "Pending"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openViewDialog(record)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(record)}><Edit className="h-4 w-4" /></Button>
                      {record.status === "pending" && (
                        <Button variant="ghost" size="icon" onClick={() => handleMarkAsPaid(record.id)}><CheckCircle className="h-4 w-4" /></Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Salary Details</DialogTitle></DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedRecord.employee.avatar} />
                  <AvatarFallback className="text-lg">{selectedRecord.employee.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedRecord.employee.name}</h3>
                  <p className="text-muted-foreground">{selectedRecord.employee.position}</p>
                </div>
              </div>
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex justify-between"><span>Base Salary:</span><span>{formatCurrency(selectedRecord.baseSalary)}</span></div>
                <div className="flex justify-between text-primary"><span>Bonus:</span><span>+{formatCurrency(selectedRecord.bonus)}</span></div>
                <div className="flex justify-between text-destructive"><span>Deductions:</span><span>-{formatCurrency(selectedRecord.deductions)}</span></div>
                <div className="flex justify-between border-t pt-2 font-semibold"><span>Net Salary:</span><span>{formatCurrency(selectedRecord.netSalary)}</span></div>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground">Status:</Label>
                <Badge variant={selectedRecord.status === "paid" ? "default" : "secondary"}>{selectedRecord.status === "paid" ? "Paid" : "Pending"}</Badge>
              </div>
            </div>
          )}
          <DialogFooter><Button onClick={() => setIsViewDialogOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Salary</DialogTitle><DialogDescription>Update salary details for {selectedRecord?.employee.name}.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Base Salary ($)</Label><Input type="number" value={formData.baseSalary} onChange={(e) => setFormData({ ...formData, baseSalary: parseInt(e.target.value) || 0 })} /></div>
            <div className="space-y-2"><Label>Bonus ($)</Label><Input type="number" value={formData.bonus} onChange={(e) => setFormData({ ...formData, bonus: parseInt(e.target.value) || 0 })} /></div>
            <div className="space-y-2"><Label>Deductions ($)</Label><Input type="number" value={formData.deductions} onChange={(e) => setFormData({ ...formData, deductions: parseInt(e.target.value) || 0 })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Payroll;
