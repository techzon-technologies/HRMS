import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, FileText, AlertTriangle, CheckCircle, Clock, MoreVertical } from "lucide-react";

interface VisaRecord {
  id: number;
  employee: string;
  type: string;
  number: string;
  issueDate: string;
  expiryDate: string;
  status: "Active" | "Expiring Soon" | "Expired";
}

// Initial data removed
const stats = [
  { label: "Total Documents", value: "0", icon: FileText, color: "text-primary" },
  { label: "Active Visas", value: "0", icon: CheckCircle, color: "text-emerald-600" },
  { label: "Expiring Soon", value: "0", icon: Clock, color: "text-amber-600" },
  { label: "Expired", value: "0", icon: AlertTriangle, color: "text-destructive" },
];

export default function VisaDocuments() {
  const { toast } = useToast();
  const [visaData, setVisaData] = useState<VisaRecord[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedVisa, setSelectedVisa] = useState<VisaRecord | null>(null);
  const [newVisa, setNewVisa] = useState({ employeeId: "", type: "", visaNumber: "", issueDate: "", expiryDate: "" });
  const [statsData, setStatsData] = useState(stats);

  const fetchData = async () => {
    try {
      const [visas, employeesData] = await Promise.all([
        apiService.visas.getAll(),
        apiService.employees.getAll()
      ]);

      const formattedVisas = visas.map((v: any) => ({
        id: v.id,
        employee: v.employee ? `${v.employee.firstName} ${v.employee.lastName}` : "Unknown",
        type: v.type,
        number: v.visaNumber,
        issueDate: v.issueDate,
        expiryDate: v.expiryDate,
        status: v.status
      }));

      setVisaData(formattedVisas);
      setEmployees(employeesData);

      // Calculate Stats
      const total = formattedVisas.length;
      const active = formattedVisas.filter((v: any) => v.status === 'Active').length;
      const expiring = formattedVisas.filter((v: any) => v.status === 'Expiring Soon').length;
      const expired = formattedVisas.filter((v: any) => v.status === 'Expired').length;

      setStatsData([
        { label: "Total Documents", value: total.toString(), icon: FileText, color: "text-primary" },
        { label: "Active Visas", value: active.toString(), icon: CheckCircle, color: "text-emerald-600" },
        { label: "Expiring Soon", value: expiring.toString(), icon: Clock, color: "text-amber-600" },
        { label: "Expired", value: expired.toString(), icon: AlertTriangle, color: "text-destructive" },
      ]);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch data.", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = visaData.filter((visa) =>
    visa.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
    visa.number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddVisa = async () => {
    try {
      if (!newVisa.employeeId || !newVisa.type || !newVisa.expiryDate || !newVisa.visaNumber) {
        toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" });
        return;
      }

      await apiService.visas.create({
        employeeId: parseInt(newVisa.employeeId),
        type: newVisa.type,
        visaNumber: newVisa.visaNumber,
        issueDate: newVisa.issueDate,
        expiryDate: newVisa.expiryDate,
        status: "Active" // You might want to calculate this server-side or client-side based on date
      });

      toast({ title: "Success", description: "Visa record added successfully." });
      setIsAddDialogOpen(false);
      setNewVisa({ employeeId: "", type: "", visaNumber: "", issueDate: "", expiryDate: "" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create visa record.", variant: "destructive" });
    }
  };

  const handleView = (visa: VisaRecord) => { setSelectedVisa(visa); setIsViewDialogOpen(true); };

  const handleDelete = async (visa: VisaRecord) => {
    try {
      await apiService.visas.delete(visa.id);
      toast({ title: "Deleted", description: "Visa record deleted successfully." });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete record.", variant: "destructive" });
    }
  };

  return (
    <MainLayout title="Visa & Document Management" subtitle="Track and manage employee visas and documents">
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <Button onClick={() => setIsAddDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Document</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {statsData.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-lg bg-muted p-3 ${stat.color}`}><stat.icon className="h-6 w-6" /></div>
                <div><p className="text-2xl font-bold">{stat.value}</p><p className="text-sm text-muted-foreground">{stat.label}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Visa Records</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search visas..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead><TableHead>Visa Type</TableHead><TableHead>Visa Number</TableHead>
                  <TableHead>Issue Date</TableHead><TableHead>Expiry Date</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((visa) => (
                  <TableRow key={visa.id}>
                    <TableCell className="font-medium">{visa.employee}</TableCell>
                    <TableCell>{visa.type}</TableCell><TableCell>{visa.number}</TableCell>
                    <TableCell>{visa.issueDate}</TableCell><TableCell>{visa.expiryDate}</TableCell>
                    <TableCell>
                      <Badge variant={visa.status === "Active" ? "default" : visa.status === "Expiring Soon" ? "secondary" : "destructive"}>{visa.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(visa)}>View</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(visa)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Document</DialogTitle><DialogDescription>Add a visa or document record.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select value={newVisa.employeeId} onValueChange={(v) => setNewVisa({ ...newVisa, employeeId: v })}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Visa Type</Label>
              <Select value={newVisa.type} onValueChange={(v) => setNewVisa({ ...newVisa, type: v })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent><SelectItem value="Work Visa">Work Visa</SelectItem><SelectItem value="Residence Visa">Residence Visa</SelectItem><SelectItem value="Visit Visa">Visit Visa</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Visa Number</Label><Input value={newVisa.visaNumber} onChange={(e) => setNewVisa({ ...newVisa, visaNumber: e.target.value })} placeholder="Enter visa number" /></div>
            <div className="space-y-2"><Label>Issue Date</Label><Input type="date" value={newVisa.issueDate} onChange={(e) => setNewVisa({ ...newVisa, issueDate: e.target.value })} /></div>
            <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={newVisa.expiryDate} onChange={(e) => setNewVisa({ ...newVisa, expiryDate: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button><Button onClick={handleAddVisa}>Add Document</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Document Details</DialogTitle></DialogHeader>
          {selectedVisa && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div><p className="text-sm text-muted-foreground">Employee</p><p className="font-medium">{selectedVisa.employee}</p></div>
              <div><p className="text-sm text-muted-foreground">Type</p><p className="font-medium">{selectedVisa.type}</p></div>
              <div><p className="text-sm text-muted-foreground">Number</p><p className="font-medium">{selectedVisa.number}</p></div>
              <div><p className="text-sm text-muted-foreground">Status</p><Badge variant={selectedVisa.status === "Active" ? "default" : "secondary"}>{selectedVisa.status}</Badge></div>
              <div><p className="text-sm text-muted-foreground">Issue Date</p><p className="font-medium">{selectedVisa.issueDate}</p></div>
              <div><p className="text-sm text-muted-foreground">Expiry Date</p><p className="font-medium">{selectedVisa.expiryDate}</p></div>
            </div>
          )}
          <DialogFooter><Button onClick={() => setIsViewDialogOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
