import { useState, useEffect, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
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
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, ClipboardCheck, AlertTriangle, CheckCircle, Clock, Eye, Edit, Trash2, FileText, BarChart3, PieChart, Calendar } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell,
} from "recharts";
import { apiService } from "@/lib/api";

interface AuditRecord {
  id: number;
  area: string;
  lastAudit: string;
  nextAudit: string;
  findings: number;
  status: string;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export default function ComplianceAudit() {
  const { toast } = useToast();
  const [auditData, setAuditData] = useState<AuditRecord[]>([]);
  const auditDataRef = useRef<AuditRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);
  const [formData, setFormData] = useState({
    area: "",
    lastAudit: "",
    nextAudit: "",
    findings: 0,
    status: "Pending Review",
    score: 0,
  });

  // Fetch audit data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const auditResponse = await apiService.compliance.getAll();
        
        const auditData: AuditRecord[] = Array.isArray(auditResponse) ? auditResponse : [];
        
        setAuditData(auditData);
        auditDataRef.current = auditData;
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load compliance audit data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = auditData.filter((a) =>
    a.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const avgScore = Math.round(auditData.reduce((sum, a) => sum + a.score, 0) / auditData.length);
  const stats = [
    { label: "Overall Compliance", value: `${avgScore}%`, icon: ClipboardCheck, color: "text-primary" },
    { label: "Compliant Areas", value: auditData.filter(a => a.status === "Compliant").length.toString(), icon: CheckCircle, color: "text-emerald-600" },
    { label: "Pending Audits", value: auditData.filter(a => a.status === "Pending Review").length.toString(), icon: Clock, color: "text-amber-600" },
    { label: "Open Findings", value: auditData.reduce((sum, a) => sum + a.findings, 0).toString(), icon: AlertTriangle, color: "text-destructive" },
  ];

  // Chart data
  const auditsByArea = [
    { name: "Labor Law", value: 95 },
    { name: "Health & Safety", value: 78 },
    { name: "Data Protection", value: 98 },
    { name: "WPS", value: 100 },
    { name: "Immigration", value: 85 },
  ];

  const auditsByStatus = [
    { name: "Compliant", value: auditData.filter(a => a.status === "Compliant").length },
    { name: "Pending Review", value: auditData.filter(a => a.status === "Pending Review").length },
    { name: "Needs Improvement", value: auditData.filter(a => a.status === "Needs Improvement").length },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];

  const handleAdd = async () => {
    try {
      const auditData = {
        area: formData.area,
        lastAudit: formData.lastAudit,
        nextAudit: formData.nextAudit,
        findings: formData.findings,
        status: formData.status,
        score: formData.score,
      };

      const newRecord: any = await apiService.compliance.create(auditData);
      
      const recordWithTimestamps: AuditRecord = {
        id: newRecord.id || 0,
        area: newRecord.area || '',
        lastAudit: newRecord.lastAudit || '',
        nextAudit: newRecord.nextAudit || '',
        findings: newRecord.findings || 0,
        status: newRecord.status || '',
        score: newRecord.score || 0,
        createdAt: newRecord.createdAt || '',
        updatedAt: newRecord.updatedAt || ''
      };
      
      const currentData = [...auditDataRef.current];
      const updatedData: AuditRecord[] = [...currentData, recordWithTimestamps];
      setAuditData(updatedData);
      setIsAddDialogOpen(false);
      setFormData({ area: "", lastAudit: "", nextAudit: "", findings: 0, status: "Pending Review", score: 0 });
      toast({ title: "Audit Scheduled", description: `Audit for ${formData.area} has been scheduled.` });
    } catch (error) {
      console.error('Error creating audit record:', error);
      toast({
        title: "Error",
        description: "Failed to create audit record",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedRecord) return;
    
    try {
      const auditData = {
        area: formData.area,
        lastAudit: formData.lastAudit,
        nextAudit: formData.nextAudit,
        findings: formData.findings,
        status: formData.status,
        score: formData.score,
      };

      const updatedRecord: any = await apiService.compliance.update(selectedRecord.id, auditData);
      
      const recordWithTimestamps: AuditRecord = {
        id: updatedRecord.id || 0,
        area: updatedRecord.area || '',
        lastAudit: updatedRecord.lastAudit || '',
        nextAudit: updatedRecord.nextAudit || '',
        findings: updatedRecord.findings || 0,
        status: updatedRecord.status || '',
        score: updatedRecord.score || 0,
        createdAt: updatedRecord.createdAt || '',
        updatedAt: updatedRecord.updatedAt || ''
      };
      
      const currentData = [...auditDataRef.current];
      const updatedData: AuditRecord[] = currentData.map((a) => a.id === selectedRecord.id ? recordWithTimestamps : a);
      setAuditData(updatedData);
      setIsEditDialogOpen(false);
      toast({ title: "Audit Updated", description: "Audit record has been updated successfully." });
    } catch (error) {
      console.error('Error updating audit record:', error);
      toast({
        title: "Error",
        description: "Failed to update audit record",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this audit record?')) {
      try {
        await apiService.compliance.delete(id);
        
        const updatedData = auditData.filter((a) => a.id !== id);
        setAuditData(updatedData);
        auditDataRef.current = updatedData;
        toast({ title: "Audit Deleted", description: "Audit record has been deleted." });
      } catch (error) {
        console.error('Error deleting audit record:', error);
        toast({
          title: "Error",
          description: "Failed to delete audit record",
          variant: "destructive",
        });
      }
    }
  };

  const openEditDialog = (record: AuditRecord) => {
    setSelectedRecord(record);
    setFormData({ 
      area: record.area, 
      lastAudit: record.lastAudit, 
      nextAudit: record.nextAudit, 
      findings: record.findings, 
      status: record.status, 
      score: record.score 
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (record: AuditRecord) => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };

  const handleViewReport = (record: AuditRecord) => {
    toast({ title: "Report Opening", description: `Opening audit report for ${record.area}...` });
  };

  return (
    <MainLayout title="Compliance & Audit" subtitle="Track regulatory compliance and audit schedules">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-lg bg-muted p-3 ${stat.color}`}><stat.icon className="h-6 w-6" /></div>
                <div>
                  <p className="text-2xl font-bold">{isLoading ? '...' : stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compliance Scores by Area</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={auditsByArea}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Score']}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} 
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Audits by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={auditsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {auditsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} audits`, 'Count']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Audit Schedule & Results</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search audits..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Schedule Audit</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Compliance Area</TableHead>
                  <TableHead>Last Audit</TableHead>
                  <TableHead>Next Audit</TableHead>
                  <TableHead>Findings</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((audit) => (
                  <TableRow key={audit.id}>
                    <TableCell className="font-medium">{audit.area}</TableCell>
                    <TableCell>{audit.lastAudit}</TableCell>
                    <TableCell>{audit.nextAudit}</TableCell>
                    <TableCell>{audit.findings}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={audit.score} className="w-16 h-2" />
                        <span className="text-sm">{audit.score}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={audit.status === "Compliant" ? "default" : audit.status === "Pending Review" ? "secondary" : "destructive"}>{audit.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewReport(audit)}><FileText className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openViewDialog(audit)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(audit)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(audit.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Schedule Audit</DialogTitle><DialogDescription>Schedule a new compliance audit.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Compliance Area</Label><Input value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Last Audit Date</Label><Input type="date" value={formData.lastAudit} onChange={(e) => setFormData({ ...formData, lastAudit: e.target.value })} /></div>
              <div className="space-y-2"><Label>Next Audit Date</Label><Input type="date" value={formData.nextAudit} onChange={(e) => setFormData({ ...formData, nextAudit: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Audit</DialogTitle><DialogDescription>Update audit details.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Compliance Area</Label><Input value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Last Audit Date</Label><Input type="date" value={formData.lastAudit} onChange={(e) => setFormData({ ...formData, lastAudit: e.target.value })} /></div>
              <div className="space-y-2"><Label>Next Audit Date</Label><Input type="date" value={formData.nextAudit} onChange={(e) => setFormData({ ...formData, nextAudit: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Findings</Label><Input type="number" value={formData.findings} onChange={(e) => setFormData({ ...formData, findings: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Score (%)</Label><Input type="number" value={formData.score} onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="space-y-2"><Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Compliant">Compliant</SelectItem>
                  <SelectItem value="Pending Review">Pending Review</SelectItem>
                  <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Audit Details</DialogTitle></DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Compliance Area</Label><p className="font-medium">{selectedRecord.area}</p></div>
                <div><Label className="text-muted-foreground">Status</Label><div className="mt-1"><Badge variant={selectedRecord.status === "Compliant" ? "default" : selectedRecord.status === "Pending Review" ? "secondary" : "destructive"}>{selectedRecord.status}</Badge></div></div>
                <div><Label className="text-muted-foreground">Last Audit</Label><p className="font-medium">{selectedRecord.lastAudit}</p></div>
                <div><Label className="text-muted-foreground">Next Audit</Label><p className="font-medium">{selectedRecord.nextAudit}</p></div>
                <div><Label className="text-muted-foreground">Findings</Label><p className="font-medium">{selectedRecord.findings}</p></div>
                <div><Label className="text-muted-foreground">Score</Label><div className="flex items-center gap-2 mt-1"><Progress value={selectedRecord.score} className="w-16 h-2" /><span>{selectedRecord.score}%</span></div></div>
              </div>
            </div>
          )}
          <DialogFooter><Button onClick={() => setIsViewDialogOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}