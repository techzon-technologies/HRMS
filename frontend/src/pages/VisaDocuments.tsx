import { useState } from "react";
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

const initialVisaData: VisaRecord[] = [
  { id: 1, employee: "Ahmed Hassan", type: "Work Visa", number: "V-2024-001", issueDate: "2024-01-15", expiryDate: "2026-01-14", status: "Active" },
  { id: 2, employee: "Sara Ali", type: "Residence Visa", number: "V-2024-002", issueDate: "2023-06-20", expiryDate: "2024-06-19", status: "Expiring Soon" },
  { id: 3, employee: "Mohammed Khan", type: "Work Visa", number: "V-2024-003", issueDate: "2024-03-10", expiryDate: "2026-03-09", status: "Active" },
  { id: 4, employee: "Fatima Yusuf", type: "Work Visa", number: "V-2024-004", issueDate: "2022-11-01", expiryDate: "2024-10-31", status: "Expired" },
  { id: 5, employee: "Omar Abdullah", type: "Residence Visa", number: "V-2024-005", issueDate: "2024-02-28", expiryDate: "2026-02-27", status: "Active" },
];

const stats = [
  { label: "Total Documents", value: "156", icon: FileText, color: "text-primary" },
  { label: "Active Visas", value: "142", icon: CheckCircle, color: "text-emerald-600" },
  { label: "Expiring Soon", value: "8", icon: Clock, color: "text-amber-600" },
  { label: "Expired", value: "6", icon: AlertTriangle, color: "text-destructive" },
];

export default function VisaDocuments() {
  const { toast } = useToast();
  const [visaData, setVisaData] = useState<VisaRecord[]>(initialVisaData);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedVisa, setSelectedVisa] = useState<VisaRecord | null>(null);
  const [newVisa, setNewVisa] = useState({ employee: "", type: "", issueDate: "", expiryDate: "" });

  const filteredData = visaData.filter((visa) =>
    visa.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
    visa.number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddVisa = () => {
    if (!newVisa.employee || !newVisa.type || !newVisa.expiryDate) {
      toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    const visa: VisaRecord = {
      id: visaData.length + 1,
      employee: newVisa.employee,
      type: newVisa.type,
      number: `V-2024-${String(visaData.length + 1).padStart(3, "0")}`,
      issueDate: newVisa.issueDate || new Date().toISOString().split("T")[0],
      expiryDate: newVisa.expiryDate,
      status: "Active",
    };
    setVisaData([visa, ...visaData]);
    setNewVisa({ employee: "", type: "", issueDate: "", expiryDate: "" });
    setIsAddDialogOpen(false);
    toast({ title: "Document Added", description: `Visa document for ${visa.employee} has been added.` });
  };

  const handleView = (visa: VisaRecord) => { setSelectedVisa(visa); setIsViewDialogOpen(true); };
  const handleDelete = (visa: VisaRecord) => {
    setVisaData(visaData.filter((v) => v.id !== visa.id));
    toast({ title: "Document Deleted", description: `Visa ${visa.number} has been deleted.` });
  };

  return (
    <MainLayout title="Visa & Document Management" subtitle="Track and manage employee visas and documents">
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <Button onClick={() => setIsAddDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Document</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => (
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
            <div className="space-y-2"><Label>Employee Name</Label><Input value={newVisa.employee} onChange={(e) => setNewVisa({ ...newVisa, employee: e.target.value })} placeholder="Enter employee name" /></div>
            <div className="space-y-2"><Label>Visa Type</Label>
              <Select value={newVisa.type} onValueChange={(v) => setNewVisa({ ...newVisa, type: v })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent><SelectItem value="Work Visa">Work Visa</SelectItem><SelectItem value="Residence Visa">Residence Visa</SelectItem><SelectItem value="Visit Visa">Visit Visa</SelectItem></SelectContent>
              </Select>
            </div>
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
