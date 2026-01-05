import axios from 'axios';

// Create axios instance with base configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3018/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If data is FormData, let the browser set the Content-Type header with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Employee API endpoints
export const employeeAPI = {
  getAll: () => api.get('/employees'),
  getById: (id: number) => api.get(`/employees/${id}`),
  create: (data: any) => api.post('/employees', data),
  update: (id: number, data: any) => api.put(`/employees/${id}`, data),
  delete: (id: number) => api.delete(`/employees/${id}`),
};

interface Expense {
  id: number;
  employeeId: number;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  category: string;
  description: string;
  amount: number;
  date: string;
  receipt: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  updatedAt: string;
}

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  employeeId: string;
  // Add other employee properties as needed
}

// Create a unified API service
export const apiService = {
  expenses: {
    getAll: async (): Promise<Expense[]> => {
      const response = await api.get('/expenses');
      return ((response.data as any[]) || []).map((exp: any) => ({
        id: exp.id,
        employeeId: exp.employee_id,
        employee: exp.employee ? {
          id: exp.employee.id,
          firstName: exp.employee.first_name,
          lastName: exp.employee.last_name,
          employeeId: exp.employee.employee_id
        } : { id: 0, firstName: 'Unknown', lastName: '', employeeId: '' },
        category: exp.category,
        description: exp.description,
        amount: parseFloat(exp.amount),
        date: exp.expense_date,
        receipt: exp.receipt_url,
        status: exp.status.charAt(0).toUpperCase() + exp.status.slice(1),
        createdAt: exp.createdAt,
        updatedAt: exp.updatedAt
      }));
    },
    getById: async (id: number): Promise<Expense> => {
      const response = await api.get(`/expenses/${id}`);
      const exp = response.data as any;
      return {
        id: exp.id,
        employeeId: exp.employee_id,
        employee: exp.employee,
        category: exp.category,
        description: exp.description,
        amount: parseFloat(exp.amount),
        date: exp.expense_date,
        receipt: exp.receipt_url,
        status: exp.status.charAt(0).toUpperCase() + exp.status.slice(1),
        createdAt: exp.createdAt,
        updatedAt: exp.updatedAt
      };
    },
    create: async (data: any): Promise<Expense> => {
      // Map frontend category to database ENUM values
      const categoryMap: Record<string, string> = {
        'Travel': 'travel',
        'Office Supplies': 'supplies',
        'Software': 'other',
        'Training': 'other',
        'Equipment': 'other',
        'Meals': 'meals',
        'Meals & Entertainment': 'meals',
        'Other': 'other'
      };
      
      // Backend expects snake_case field names
      const payload = {
        employee_id: data.employeeId,
        expense_date: data.date,
        receipt_url: data.receipt,
        category: categoryMap[data.category] || 'other',
        description: data.description,
        amount: data.amount,
        status: 'pending'
      };
      
      const response = await api.post('/expenses', payload);
      const exp = response.data as any;
      return {
        id: exp.id,
        employeeId: exp.employee_id,
        employee: { id: data.employeeId, firstName: '', lastName: '', employeeId: '' }, // Optimistic return or refetch
        category: data.category, // Return original category for display
        description: exp.description,
        amount: parseFloat(exp.amount),
        date: exp.expense_date,
        receipt: exp.receipt_url,
        status: exp.status.charAt(0).toUpperCase() + exp.status.slice(1),
        createdAt: exp.createdAt,
        updatedAt: exp.updatedAt
      };
    },
    update: async (id: number, data: any): Promise<Expense> => {
      // Backend expects snake_case field names
      const payload: any = {};
      if (data.employeeId !== undefined) payload.employee_id = data.employeeId;
      if (data.date !== undefined) payload.expense_date = data.date;
      if (data.receipt !== undefined) payload.receipt_url = data.receipt;
      if (data.category !== undefined) payload.category = data.category;
      if (data.description !== undefined) payload.description = data.description;
      if (data.amount !== undefined) payload.amount = data.amount;
      if (data.status !== undefined) payload.status = data.status.toLowerCase();
      
      const response = await api.put(`/expenses/${id}`, payload);
      return response.data as Expense || {} as Expense;
    },
    delete: async (id: number): Promise<Expense> => {
      const response = await api.delete(`/expenses/${id}`);
      return response.data as Expense || {} as Expense;
    },
    approve: async (id: number): Promise<Expense> => {
      const response = await api.patch(`/expenses/${id}/approve`);
      return response.data as Expense || {} as Expense;
    },
    reject: async (id: number): Promise<Expense> => {
      const response = await api.patch(`/expenses/${id}/reject`);
      return response.data as Expense || {} as Expense;
    },
  },
  assets: {
    getAll: async (): Promise<any[]> => {
      const response = await api.get('/assets');
      return ((response.data as any[]) || []).map((asset: any) => ({
        id: asset.id,
        assetTag: asset.asset_tag,
        name: asset.name,
        category: asset.category,
        assignedTo: asset.employee ? {
          id: asset.employee.id,
          firstName: asset.employee.first_name,
          lastName: asset.employee.last_name,
          employeeId: asset.employee.employee_id
        } : null,
        assignedToId: asset.assigned_to,
        purchaseDate: asset.purchase_date,
        value: parseFloat(asset.value),
        status: asset.status.charAt(0).toUpperCase() + asset.status.slice(1).replace('_', ' '),
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt
      }));
    },
    getById: async (id: number): Promise<any> => {
      const response = await api.get(`/assets/${id}`);
      const asset = response.data as any;
      return {
        id: asset.id,
        assetTag: asset.asset_tag,
        name: asset.name,
        category: asset.category,
        assignedTo: asset.employee,
        assignedToId: asset.assigned_to,
        purchaseDate: asset.purchase_date,
        value: parseFloat(asset.value),
        status: asset.status.charAt(0).toUpperCase() + asset.status.slice(1).replace('_', ' '),
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt
      };
    },
    create: async (data: any): Promise<any> => {
      // Map frontend status to database ENUM values
      const statusMap: Record<string, string> = {
        'In Use': 'assigned',
        'Available': 'available',
        'Maintenance': 'maintenance',
        'Retired': 'scrapped'
      };
      
      // Backend expects snake_case
      const payload = {
        name: data.name,
        asset_tag: data.assetTag || `AST-${Date.now()}`, // Generate tag if missing
        category: data.category,
        assigned_to: data.assignedToId || null,
        purchase_date: data.purchaseDate,
        value: data.value,
        status: data.assignedToId ? 'assigned' : (statusMap[data.status] || 'available')
      };
      const response = await api.post('/assets', payload);
      const asset = response.data as any;
      
      // Map database status back to frontend display status
      const displayStatusMap: Record<string, string> = {
        'assigned': 'In Use',
        'available': 'Available',
        'maintenance': 'Maintenance',
        'scrapped': 'Retired'
      };
      
      return {
        id: asset.id,
        assetTag: asset.asset_tag,
        name: asset.name,
        category: asset.category,
        assignedTo: null, // Optimistic update requiring fetch usually
        assignedToId: asset.assigned_to,
        purchaseDate: asset.purchase_date,
        value: parseFloat(asset.value),
        status: displayStatusMap[asset.status] || asset.status,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt
      };
    },
    update: async (id: number, data: any): Promise<any> => {
      // Map frontend status to database ENUM values
      const statusMap: Record<string, string> = {
        'In Use': 'assigned',
        'Available': 'available',
        'Maintenance': 'maintenance',
        'Retired': 'scrapped'
      };
      
      const payload: any = {};
      if (data.status) payload.status = statusMap[data.status] || data.status.toLowerCase();
      if (data.assignedToId !== undefined) payload.assigned_to = data.assignedToId;

      const response = await api.put(`/assets/${id}`, payload);
      return response.data || {};
    },
    delete: async (id: number): Promise<any> => {
      const response = await api.delete(`/assets/${id}`);
      return response.data || {};
    },
    assign: async (id: number, data: any): Promise<any> => {
      const response = await api.patch(`/assets/${id}/assign`, { assigned_to: data.assignedToId });
      return response.data || {};
    },
  },
  benefits: {
    getAll: async (): Promise<any[]> => {
      const response = await api.get('/benefits');
      const benefits = (response.data as any[]) || [];
      return benefits.map((benefit: any) => ({
        id: benefit.id,
        employeeId: benefit.employee_id,
        employee: benefit.employee ? {
          id: benefit.employee.id,
          firstName: benefit.employee.firstName,
          lastName: benefit.employee.lastName,
          employeeId: benefit.employee.employeeId,
        } : null,
        yearsOfService: parseFloat(benefit.years_of_service),
        basicSalary: parseFloat(benefit.basic_salary),
        gratuityAmount: parseFloat(benefit.gratuity_amount),
        status: benefit.status ? benefit.status.charAt(0).toUpperCase() + benefit.status.slice(1).replace('_', ' ') : 'Accruing',
        createdAt: benefit.createdAt,
        updatedAt: benefit.updatedAt
      }));
    },
    getById: async (id: number): Promise<any> => {
      const response = await api.get(`/benefits/${id}`);
      const benefit = response.data as any;
      if (!benefit) return {};
      return {
        id: benefit.id,
        employeeId: benefit.employee_id,
        employee: benefit.employee,
        yearsOfService: parseFloat(benefit.years_of_service),
        basicSalary: parseFloat(benefit.basic_salary),
        gratuityAmount: parseFloat(benefit.gratuity_amount),
        status: benefit.status ? benefit.status.charAt(0).toUpperCase() + benefit.status.slice(1).replace('_', ' ') : 'Accruing',
        createdAt: benefit.createdAt,
        updatedAt: benefit.updatedAt
      };
    },
    create: async (data: any): Promise<any> => {
      const payload = {
        employee_id: data.employeeId,
        years_of_service: data.yearsOfService,
        basic_salary: data.basicSalary,
        gratuity_amount: data.gratuityAmount,
        status: data.status ? data.status.toLowerCase().replace(' ', '_') : 'accruing'
      };
      const response = await api.post('/benefits', payload);
      const benefit = response.data as any;
      return {
        id: benefit.id,
        employeeId: benefit.employee_id,
        employee: null, // Optimistic update usually requires fetching or passing employee object
        yearsOfService: parseFloat(benefit.years_of_service),
        basicSalary: parseFloat(benefit.basic_salary),
        gratuityAmount: parseFloat(benefit.gratuity_amount),
        status: benefit.status ? benefit.status.charAt(0).toUpperCase() + benefit.status.slice(1).replace('_', ' ') : 'Accruing',
        createdAt: benefit.createdAt,
        updatedAt: benefit.updatedAt
      };
    },
    update: async (id: number, data: any): Promise<any> => {
      const payload: any = {};
      if (data.employeeId !== undefined) payload.employee_id = data.employeeId;
      if (data.yearsOfService !== undefined) payload.years_of_service = data.yearsOfService;
      if (data.basicSalary !== undefined) payload.basic_salary = data.basicSalary;
      if (data.gratuityAmount !== undefined) payload.gratuity_amount = data.gratuityAmount;
      if (data.status) payload.status = data.status.toLowerCase().replace(' ', '_');

      const response = await api.put(`/benefits/${id}`, payload);
      const benefit = response.data as any;
      return {
        id: benefit.id,
        employeeId: benefit.employee_id,
        employee: benefit.employee,
        yearsOfService: parseFloat(benefit.years_of_service),
        basicSalary: parseFloat(benefit.basic_salary),
        gratuityAmount: parseFloat(benefit.gratuity_amount),
        status: benefit.status ? benefit.status.charAt(0).toUpperCase() + benefit.status.slice(1).replace('_', ' ') : 'Accruing',
        createdAt: benefit.createdAt,
        updatedAt: benefit.updatedAt
      };
    },
    delete: async (id: number): Promise<any> => {
      const response = await api.delete(`/benefits/${id}`);
      return response.data || {};
    },
  },
  payrolls: {
    getAll: async (): Promise<any[]> => {
      const response = await api.get('/payrolls');
      const payrolls = (response.data as any[]) || [];
      return payrolls.map((payroll: any) => ({
        id: payroll.id,
        employeeId: payroll.employee_id,
        employee: payroll.employee ? {
          id: payroll.employee.id,
          firstName: payroll.employee.firstName,
          lastName: payroll.employee.lastName,
          employeeId: payroll.employee.employeeId,
        } : null,
        // Bank details are not yet in backend, using placeholders or derived data
        bankName: "Bank of Dubai",
        accountNo: payroll.transaction_ref || `AE${payroll.employee_id}0000${payroll.id}`,
        salary: parseFloat(payroll.base_salary),
        allowances: parseFloat(payroll.bonus || 0),
        deductions: parseFloat(payroll.deductions || 0),
        netPay: parseFloat(payroll.net_salary),
        status: payroll.status ? payroll.status.charAt(0).toUpperCase() + payroll.status.slice(1) : 'Pending',
        createdAt: payroll.createdAt,
        updatedAt: payroll.updatedAt
      }));
    },
    getById: async (id: number): Promise<any> => {
      const response = await api.get(`/payrolls/${id}`);
      const payroll = response.data as any;
      if (!payroll) return {};
      return {
        id: payroll.id,
        employeeId: payroll.employee_id,
        employee: payroll.employee,
        bankName: "Bank of Dubai",
        accountNo: payroll.transaction_ref || `AE${payroll.employee_id}0000${payroll.id}`,
        salary: parseFloat(payroll.base_salary),
        allowances: parseFloat(payroll.bonus || 0),
        deductions: parseFloat(payroll.deductions || 0),
        netPay: parseFloat(payroll.net_salary),
        status: payroll.status ? payroll.status.charAt(0).toUpperCase() + payroll.status.slice(1) : 'Pending',
        createdAt: payroll.createdAt,
        updatedAt: payroll.updatedAt
      };
    },
    create: async (data: any): Promise<any> => {
      // Create payload matching backend snake_case
      const payload = {
        employee_id: data.employeeId,
        base_salary: data.salary,
        bonus: data.allowances,
        deductions: data.deductions,
        net_salary: data.netPay, // Frontend calculates netPay or backend should? Usually backend, but passing for now if backend accepts it
        status: data.status ? data.status.toLowerCase() : 'pending',
        month: new Date().getMonth() + 1, // Default to current month/year if not provided
        year: new Date().getFullYear()
      };

      const response = await api.post('/payrolls', payload);
      const payroll = response.data as any;
      return {
        id: payroll.id,
        employeeId: payroll.employee_id,
        employee: null,
        bankName: "Bank of Dubai",
        accountNo: payroll.transaction_ref || `AE${payroll.employee_id}0000${payroll.id}`,
        salary: parseFloat(payroll.base_salary),
        allowances: parseFloat(payroll.bonus || 0),
        deductions: parseFloat(payroll.deductions || 0),
        netPay: parseFloat(payroll.net_salary),
        status: payroll.status ? payroll.status.charAt(0).toUpperCase() + payroll.status.slice(1) : 'Pending',
        createdAt: payroll.createdAt,
        updatedAt: payroll.updatedAt
      };
    },
    update: async (id: number, data: any): Promise<any> => {
      const payload: any = {};
      if (data.employeeId !== undefined) payload.employee_id = data.employeeId;
      if (data.salary !== undefined) payload.base_salary = data.salary;
      if (data.allowances !== undefined) payload.bonus = data.allowances;
      if (data.deductions !== undefined) payload.deductions = data.deductions;
      if (data.netPay !== undefined) payload.net_salary = data.netPay;
      if (data.status) payload.status = data.status.toLowerCase();

      const response = await api.put(`/payrolls/${id}`, payload);
      const payroll = response.data as any;
      return {
        id: payroll.id,
        employeeId: payroll.employee_id,
        employee: payroll.employee,
        bankName: "Bank of Dubai",
        accountNo: payroll.transaction_ref || `AE${payroll.employee_id}0000${payroll.id}`,
        salary: parseFloat(payroll.base_salary),
        allowances: parseFloat(payroll.bonus || 0),
        deductions: parseFloat(payroll.deductions || 0),
        netPay: parseFloat(payroll.net_salary),
        status: payroll.status ? payroll.status.charAt(0).toUpperCase() + payroll.status.slice(1) : 'Pending',
        createdAt: payroll.createdAt,
        updatedAt: payroll.updatedAt
      };
    },
    delete: async (id: number): Promise<any> => {
      const response = await api.delete(`/payrolls/${id}`);
      return response.data || {};
    },
    process: async (id: number): Promise<any> => {
      const response = await api.put(`/payrolls/${id}`, { status: 'processed' }); // ensure backend supports this or uses specific endpoint
      const payroll = response.data as any;
      return {
        id: payroll.id,
        status: 'Processed'
      };
    },
  },
  disciplinary: {
    getAll: async (): Promise<any[]> => {
      const response = await api.get('/disciplinary');
      const records = (response.data as any[]) || [];
      return records.map((record: any) => ({
        id: record.id,
        employeeId: record.employee_id,
        employee: record.employee ? {
          id: record.employee.id,
          firstName: record.employee.firstName,
          lastName: record.employee.lastName,
          employeeId: record.employee.employeeId,
        } : null,
        type: record.type ? record.type.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '',
        reason: record.reason,
        date: record.incident_date,
        issuedBy: record.issuer ? `${record.issuer.firstName} ${record.issuer.lastName}` : (record.issued_by || ''),
        issuedById: record.issued_by,
        issuer: record.issuer ? {
          id: record.issuer.id,
          firstName: record.issuer.firstName,
          lastName: record.issuer.lastName,
          employeeId: record.issuer.employeeId
        } : null,
        status: record.status ? record.status.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Active',
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      }));
    },
    getById: async (id: number): Promise<any> => {
      const response = await api.get(`/disciplinary/${id}`);
      const record = response.data as any;
      if (!record) return {};
      return {
        id: record.id,
        employeeId: record.employee_id,
        employee: record.employee,
        type: record.type ? record.type.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '',
        reason: record.reason,
        date: record.incident_date,
        issuedBy: record.issuer ? `${record.issuer.firstName} ${record.issuer.lastName}` : (record.issued_by || ''),
        issuedById: record.issued_by,
        issuer: record.issuer,
        status: record.status ? record.status.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Active',
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      };
    },
    create: async (data: any): Promise<any> => {
      const payload = {
        employee_id: data.employeeId,
        type: data.type ? data.type.toLowerCase().replace(/ /g, '_') : 'verbal_warning',
        reason: data.reason,
        incident_date: data.date,
        issued_by: data.issuedBy, // Expecting ID now
        status: data.status ? data.status.toLowerCase().replace(/ /g, '_') : 'active'
      };

      const response = await api.post('/disciplinary', payload);
      return response.data || {};
    },
    update: async (id: number, data: any): Promise<any> => {
      const payload: any = {};
      if (data.employeeId !== undefined) payload.employee_id = data.employeeId;
      if (data.type) payload.type = data.type.toLowerCase().replace(/ /g, '_');
      if (data.reason !== undefined) payload.reason = data.reason;
      if (data.date !== undefined) payload.incident_date = data.date;
      if (data.issuedBy !== undefined) payload.issued_by = data.issuedBy;
      if (data.status) payload.status = data.status.toLowerCase().replace(/ /g, '_');

      const response = await api.put(`/disciplinary/${id}`, payload);
      return response.data || {};
    },
    delete: async (id: number): Promise<any> => {
      const response = await api.delete(`/disciplinary/${id}`);
      return response.data || {};
    },
  },
  healthInsurance: {
    getAll: async (): Promise<any[]> => {
      const response = await api.get('/health-insurance');
      const records = (response.data as any[]) || [];
      return records.map((record: any) => ({
        id: record.id,
        employeeId: record.employee_id,
        employee: record.employee ? {
          id: record.employee.id,
          firstName: record.employee.firstName,
          lastName: record.employee.lastName,
          employeeId: record.employee.employeeId,
        } : null,
        policyNo: record.policy_number,
        provider: record.provider_name,
        plan: record.plan_name,
        dependents: record.dependents_count,
        premium: parseFloat(record.premium_amount),
        expiryDate: record.expiry_date,
        status: record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1).replace('_', ' ') : 'Active',
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      }));
    },
    getById: async (id: number): Promise<any> => {
      const response = await api.get(`/health-insurance/${id}`);
      const record = response.data as any;
      if (!record) return {};
      return {
        id: record.id,
        employeeId: record.employee_id,
        employee: record.employee,
        policyNo: record.policy_number,
        provider: record.provider_name,
        plan: record.plan_name,
        dependents: record.dependents_count,
        premium: parseFloat(record.premium_amount),
        expiryDate: record.expiry_date,
        status: record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1).replace('_', ' ') : 'Active',
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      };
    },
    create: async (data: any): Promise<any> => {
      const payload = {
        employee_id: data.employeeId,
        policy_number: data.policyNo,
        provider_name: data.provider,
        plan_name: data.plan,
        dependents_count: data.dependents,
        premium_amount: data.premium,
        expiry_date: data.expiryDate,
        status: data.status ? data.status.toLowerCase().replace(/ /g, '_') : 'active'
      };

      const response = await api.post('/health-insurance', payload);
      const record = response.data as any;
      return {
        id: record.id,
        employeeId: record.employee_id,
        // return mapped object for immediate UI update if needed, though usually we rely on refresh or similar. 
        // But consistency is good.
        employee: null,
        policyNo: record.policy_number,
        provider: record.provider_name,
        plan: record.plan_name,
        dependents: record.dependents_count,
        premium: parseFloat(record.premium_amount),
        expiryDate: record.expiry_date,
        status: record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1).replace('_', ' ') : 'Active',
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      };
    },
    update: async (id: number, data: any): Promise<any> => {
      const payload: any = {};
      if (data.employeeId !== undefined) payload.employee_id = data.employeeId;
      if (data.policyNo !== undefined) payload.policy_number = data.policyNo;
      if (data.provider !== undefined) payload.provider_name = data.provider;
      if (data.plan !== undefined) payload.plan_name = data.plan;
      if (data.dependents !== undefined) payload.dependents_count = data.dependents;
      if (data.premium !== undefined) payload.premium_amount = data.premium;
      if (data.expiryDate !== undefined) payload.expiry_date = data.expiryDate;
      if (data.status) payload.status = data.status.toLowerCase().replace(/ /g, '_');

      const response = await api.put(`/health-insurance/${id}`, payload);
      const record = response.data as any;
      return {
        id: record.id,
        employeeId: record.employee_id,
        employee: record.employee,
        policyNo: record.policy_number,
        provider: record.provider_name,
        plan: record.plan_name,
        dependents: record.dependents_count,
        premium: parseFloat(record.premium_amount),
        expiryDate: record.expiry_date,
        status: record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1).replace('_', ' ') : 'Active',
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      };
    },
    delete: async (id: number): Promise<any> => {
      const response = await api.delete(`/health-insurance/${id}`);
      return response.data || {};
    },
  },
  compliance: {
    getAll: async (): Promise<any[]> => {
      const response = await api.get('/compliance');
      // Map database snake_case to frontend camelCase
      return ((response.data as any[]) || []).map((audit: any) => ({
        id: audit.id,
        area: audit.area,
        lastAudit: audit.last_audit_date,
        nextAudit: audit.next_audit_date,
        findings: audit.findings_count,
        score: audit.score,
        status: audit.status === 'compliant' ? 'Compliant' 
          : audit.status === 'needs_improvement' ? 'Needs Improvement'
          : audit.status === 'pending_review' ? 'Pending Review'
          : audit.status === 'non_compliant' ? 'Non Compliant'
          : audit.status,
        createdAt: audit.createdAt,
        updatedAt: audit.updatedAt
      }));
    },
    getById: async (id: number): Promise<any> => {
      const response = await api.get(`/compliance/${id}`);
      const audit = response.data as any;
      if (!audit) return {};
      return {
        id: audit.id,
        area: audit.area,
        lastAudit: audit.last_audit_date,
        nextAudit: audit.next_audit_date,
        findings: audit.findings_count,
        score: audit.score,
        status: audit.status === 'compliant' ? 'Compliant' 
          : audit.status === 'needs_improvement' ? 'Needs Improvement'
          : audit.status === 'pending_review' ? 'Pending Review'
          : audit.status === 'non_compliant' ? 'Non Compliant'
          : audit.status,
        createdAt: audit.createdAt,
        updatedAt: audit.updatedAt
      };
    },
    create: async (data: any): Promise<any> => {
      // Map frontend status to database ENUM values
      const statusMap: Record<string, string> = {
        'Compliant': 'compliant',
        'Needs Improvement': 'needs_improvement',
        'Pending Review': 'pending_review',
        'Non Compliant': 'non_compliant'
      };
      
      // Backend expects snake_case field names
      const payload = {
        area: data.area,
        last_audit_date: data.lastAudit,
        next_audit_date: data.nextAudit,
        findings_count: data.findings || 0,
        score: data.score || 0,
        status: statusMap[data.status] || 'pending_review'
      };
      
      const response = await api.post('/compliance', payload);
      const audit = response.data as any;
      return {
        id: audit.id,
        area: audit.area,
        lastAudit: audit.last_audit_date,
        nextAudit: audit.next_audit_date,
        findings: audit.findings_count,
        score: audit.score,
        status: data.status || 'Pending Review',
        createdAt: audit.createdAt,
        updatedAt: audit.updatedAt
      };
    },
    update: async (id: number, data: any): Promise<any> => {
      // Map frontend status to database ENUM values
      const statusMap: Record<string, string> = {
        'Compliant': 'compliant',
        'Needs Improvement': 'needs_improvement',
        'Pending Review': 'pending_review',
        'Non Compliant': 'non_compliant'
      };
      
      const payload: any = {};
      if (data.area !== undefined) payload.area = data.area;
      if (data.lastAudit !== undefined) payload.last_audit_date = data.lastAudit;
      if (data.nextAudit !== undefined) payload.next_audit_date = data.nextAudit;
      if (data.findings !== undefined) payload.findings_count = data.findings;
      if (data.score !== undefined) payload.score = data.score;
      if (data.status !== undefined) payload.status = statusMap[data.status] || data.status.toLowerCase().replace(/ /g, '_');
      
      const response = await api.put(`/compliance/${id}`, payload);
      const audit = response.data as any;
      return {
        id: audit.id,
        area: audit.area,
        lastAudit: audit.last_audit_date,
        nextAudit: audit.next_audit_date,
        findings: audit.findings_count,
        score: audit.score,
        status: audit.status === 'compliant' ? 'Compliant' 
          : audit.status === 'needs_improvement' ? 'Needs Improvement'
          : audit.status === 'pending_review' ? 'Pending Review'
          : audit.status === 'non_compliant' ? 'Non Compliant'
          : audit.status,
        createdAt: audit.createdAt,
        updatedAt: audit.updatedAt
      };
    },
    delete: async (id: number): Promise<any> => {
      const response = await api.delete(`/compliance/${id}`);
      return response.data || {};
    },
  },
  performance: {
    getAll: async (): Promise<any[]> => {
      const response = await api.get('/performance');
      // Map database snake_case to frontend camelCase
      return ((response.data as any[]) || []).map((review: any) => ({
        id: review.id,
        employeeId: review.employee_id,
        employee: review.employee ? {
          id: review.employee.id,
          firstName: review.employee.firstName,
          lastName: review.employee.lastName,
          employeeId: review.employee.employeeId
        } : { id: 0, firstName: 'Unknown', lastName: '', employeeId: '' },
        department: review.department || '',
        reviewPeriod: review.review_period || '',
        rating: parseFloat(review.rating) || 0,
        goals: review.goals || 0,
        completed: review.completed || 0,
        status: review.status === 'scheduled' ? 'Pending'
          : review.status === 'completed' ? 'Completed'
          : review.status === 'acknowledged' ? 'Completed'
          : review.status === 'in_progress' ? 'In Progress'
          : review.status,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      }));
    },
    getById: async (id: number): Promise<any> => {
      const response = await api.get(`/performance/${id}`);
      const review = response.data as any;
      if (!review) return {};
      return {
        id: review.id,
        employeeId: review.employee_id,
        employee: review.employee,
        department: review.department || '',
        reviewPeriod: review.review_period || '',
        rating: parseFloat(review.rating) || 0,
        goals: review.goals || 0,
        completed: review.completed || 0,
        status: review.status === 'scheduled' ? 'Pending'
          : review.status === 'completed' ? 'Completed'
          : review.status === 'acknowledged' ? 'Completed'
          : review.status === 'in_progress' ? 'In Progress'
          : review.status,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      };
    },
    create: async (data: any): Promise<any> => {
      // Map frontend status to database ENUM values
      const statusMap: Record<string, string> = {
        'Pending': 'scheduled',
        'In Progress': 'scheduled',
        'Completed': 'completed'
      };
      
      // Backend expects snake_case field names
      const payload = {
        employee_id: data.employeeId,
        reviewer_id: data.employeeId, // Use same employee as reviewer for now
        department: data.department,
        review_period: data.reviewPeriod,
        rating: data.rating || 0,
        goals: data.goals || 0,
        completed: data.completed || 0,
        status: statusMap[data.status] || 'scheduled'
      };
      
      const response = await api.post('/performance', payload);
      const review = response.data as any;
      return {
        id: review.id,
        employeeId: review.employee_id,
        employee: { id: data.employeeId, firstName: '', lastName: '', employeeId: '' },
        department: review.department || data.department || '',
        reviewPeriod: review.review_period || data.reviewPeriod || '',
        rating: parseFloat(review.rating) || 0,
        goals: review.goals || data.goals || 0,
        completed: review.completed || data.completed || 0,
        status: data.status || 'Pending',
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      };
    },
    update: async (id: number, data: any): Promise<any> => {
      // Map frontend status to database ENUM values
      const statusMap: Record<string, string> = {
        'Pending': 'scheduled',
        'In Progress': 'scheduled',
        'Completed': 'completed'
      };
      
      const payload: any = {};
      if (data.employeeId !== undefined) payload.employee_id = data.employeeId;
      if (data.employeeId !== undefined) payload.reviewer_id = data.employeeId;
      if (data.department !== undefined) payload.department = data.department;
      if (data.reviewPeriod !== undefined) payload.review_period = data.reviewPeriod;
      if (data.rating !== undefined) payload.rating = data.rating;
      if (data.goals !== undefined) payload.goals = data.goals;
      if (data.completed !== undefined) payload.completed = data.completed;
      if (data.status !== undefined) payload.status = statusMap[data.status] || data.status.toLowerCase().replace(/ /g, '_');
      
      const response = await api.put(`/performance/${id}`, payload);
      const review = response.data as any;
      return {
        id: review.id,
        employeeId: review.employee_id,
        employee: review.employee,
        department: review.department || '',
        reviewPeriod: review.review_period || '',
        rating: parseFloat(review.rating) || 0,
        goals: review.goals || 0,
        completed: review.completed || 0,
        status: review.status === 'scheduled' ? 'Pending'
          : review.status === 'completed' ? 'Completed'
          : review.status === 'acknowledged' ? 'Completed'
          : review.status === 'in_progress' ? 'In Progress'
          : review.status,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      };
    },
    delete: async (id: number): Promise<any> => {
      const response = await api.delete(`/performance/${id}`);
      return response.data || {};
    },
  },
  employees: {
    getAll: async (): Promise<Employee[]> => {
      const response = await api.get('/employees');
      return response.data as Employee[] || [];
    },
    getById: async (id: number): Promise<Employee> => {
      const response = await api.get(`/employees/${id}`);
      return response.data as Employee || {} as Employee;
    },
    create: async (data: any): Promise<Employee> => {
      const response = await api.post('/employees', data);
      return response.data as Employee || {} as Employee;
    },
    update: async (id: number, data: any): Promise<Employee> => {
      const response = await api.put(`/employees/${id}`, data);
      return response.data as Employee || {} as Employee;
    },
    delete: async (id: number): Promise<Employee> => {
      const response = await api.delete(`/employees/${id}`);
      return response.data as Employee || {} as Employee;
    },
  },
  auth: {
    login: async (email: string, password: string) => {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    },
    register: async (userData: any) => {
      const response = await api.post('/auth/register', userData);
      return response.data;
    },
    logout: async () => {
      const response = await api.post('/auth/logout');
      // Clear the token after logout
      localStorage.removeItem('token');
      return response.data;
    },
    me: async () => {
      const response = await api.get('/auth/me');
      return response.data;
    },
  },
  attendance: {
    getAll: async (): Promise<any[]> => {
      const response = await api.get('/attendance');
      return response.data as any[] || [];
    },
    getById: async (id: number): Promise<any> => {
      const response = await api.get(`/attendance/${id}`);
      return response.data || {};
    },
    create: async (data: any): Promise<any> => {
      const response = await api.post('/attendance', data);
      return response.data || {};
    },
    update: async (id: number, data: any): Promise<any> => {
      const response = await api.put(`/attendance/${id}`, data);
      return response.data || {};
    },
    delete: async (id: number): Promise<any> => {
      const response = await api.delete(`/attendance/${id}`);
      return response.data || {};
    },
  },
  documents: {
    getAll: async (): Promise<any[]> => {
      const response = await api.get('/documents');
      return response.data as any[] || [];
    },
    getById: async (id: number): Promise<any> => {
      const response = await api.get(`/documents/${id}`);
      return response.data || {};
    },
    create: async (data: any): Promise<any> => {
      const response = await api.post('/documents', data);
      return response.data || {};
    },
    update: async (id: number, data: any): Promise<any> => {
      const response = await api.put(`/documents/${id}`, data);
      return response.data || {};
    },
    delete: async (id: number): Promise<any> => {
      const response = await api.delete(`/documents/${id}`);
      return response.data || {};
    },
  },
  vehicles: {
    getAll: async (): Promise<any[]> => {
      const response = await api.get("/vehicles");
      const vehicles = (response.data as any[]) || [];
      return vehicles.map((v: any) => ({
        id: v.id,
        plateNo: v.plateNumber,
        make: v.make,
        model: v.model,
        year: v.year || "",
        assignedTo: v.assignedDriver ? `${v.assignedDriver.firstName} ${v.assignedDriver.lastName}` : "Unassigned",
        assignedDriverId: v.assignedDriverId,
        status: v.status === 'maintenance' ? 'In Service'
          : v.status === 'out_of_service' ? 'Out of Service'
            : 'Active', // Default to Active or map directly if simple
        nextService: v.nextService
      }));
    },
    create: async (data: any) => {
      const payload = {
        ...data,
        status: data.status === 'In Service' ? 'maintenance'
          : data.status === 'Out of Service' ? 'out_of_service'
            : 'active'
      };
      const response = await api.post("/vehicles", payload);
      return response.data;
    },
    update: async (id: number, data: any) => {
      const payload = {
        ...data,
        status: data.status === 'In Service' ? 'maintenance'
          : data.status === 'Out of Service' ? 'out_of_service'
            : 'active'
      };
      const response = await api.put(`/vehicles/${id}`, payload);
      return response.data;
    },
    delete: async (id: number) => {
      const response = await api.delete(`/vehicles/${id}`);
      return response.data;
    },
  },
  departments: {
    getAll: async () => {
      const response = await api.get("/departments");
      return response.data;
    },
    create: async (data: any) => {
      const response = await api.post("/departments", data);
      return response.data;
    },
    update: async (id: number, data: any) => {
      const response = await api.put(`/departments/${id}`, data);
      return response.data;
    },
    delete: async (id: number) => {
      const response = await api.delete(`/departments/${id}`);
      return response.data;
    },
  },
  leaves: {
    getAll: async () => {
      const response = await api.get("/leaves");
      return response.data;
    },
    getById: async (id: number) => {
      const response = await api.get(`/leaves/${id}`);
      return response.data;
    },
    create: async (data: any) => {
      const response = await api.post("/leaves", data);
      return response.data;
    },
    update: async (id: number, data: any) => {
      const response = await api.put(`/leaves/${id}`, data);
      return response.data;
    },
    delete: async (id: number) => {
      const response = await api.delete(`/leaves/${id}`);
      return response.data;
    },
    approve: async (id: number) => {
      const response = await api.patch(`/leaves/${id}/approve`);
      return response.data;
    },
    reject: async (id: number) => {
      const response = await api.patch(`/leaves/${id}/reject`);
      return response.data;
    },
  },
  visas: {
    getAll: async (): Promise<any[]> => {
      const response = await api.get('/visas');
      return response.data as any[] || [];
    },
    getById: async (id: number): Promise<any> => {
      const response = await api.get(`/visas/${id}`);
      return response.data || {};
    },
    create: async (data: any): Promise<any> => {
      const response = await api.post('/visas', data);
      return response.data || {};
    },
    update: async (id: number, data: any): Promise<any> => {
      const response = await api.put(`/visas/${id}`, data);
      return response.data || {};
    },
    delete: async (id: number): Promise<any> => {
      const response = await api.delete(`/visas/${id}`);
      return response.data || {};
    },
  },
  drivingLicences: {
    getAll: async (): Promise<any[]> => {
      const response = await api.get('/driving-licences');
      return response.data as any[] || [];
    },
    getById: async (id: number): Promise<any> => {
      const response = await api.get(`/driving-licences/${id}`);
      return response.data || {};
    },
    create: async (data: any): Promise<any> => {
      const response = await api.post('/driving-licences', data);
      return response.data || {};
    },
    update: async (id: number, data: any): Promise<any> => {
      const response = await api.put(`/driving-licences/${id}`, data);
      return response.data || {};
    },
    delete: async (id: number): Promise<any> => {
      const response = await api.delete(`/driving-licences/${id}`);
      return response.data || {};
    },
  },
  settings: {
    getCompany: async () => {
      const response = await api.get('/settings/company');
      return response.data;
    },
    updateCompany: async (data: any) => {
      const response = await api.put('/settings/company', data);
      return response.data;
    },
    updateUser: async (data: any) => {
      const response = await api.put('/settings/user', data);
      return response.data;
    }
  }
};

export default api;