import axios from 'axios';

// Create axios instance with base configuration
const API_BASE_URL = 'https://hrmsbackend.webby.one/api'; // Using domain instead of localhost

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
      return response.data as Expense[] || [];
    },
    getById: async (id: number): Promise<Expense> => {
      const response = await api.get(`/expenses/${id}`);
      return response.data as Expense || {} as Expense;
    },
    create: async (data: any): Promise<Expense> => {
      const response = await api.post('/expenses', data);
      return response.data as Expense || {} as Expense;
    },
    update: async (id: number, data: any): Promise<Expense> => {
      const response = await api.put(`/expenses/${id}`, data);
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
      return response.data as any[] || [];
    },
    getById: async (id: number): Promise<any> => {
      const response = await api.get(`/assets/${id}`);
      return response.data as any || {};
    },
    create: async (data: any): Promise<any> => {
      const response = await api.post('/assets', data);
      return response.data as any || {};
    },
    update: async (id: number, data: any): Promise<any> => {
      const response = await api.put(`/assets/${id}`, data);
      return response.data as any || {};
    },
    delete: async (id: number): Promise<any> => {
      const response = await api.delete(`/assets/${id}`);
      return response.data as any || {};
    },
    assign: async (id: number, data: any): Promise<any> => {
      const response = await api.patch(`/assets/${id}/assign`, data);
      return response.data as any || {};
    },
  },
  benefits: {
    getAll: async (): Promise<any[]> => {
      const response = await api.get('/benefits');
      return response.data as any[] || [];
    },
    getById: async (id: number): Promise<any> => {
      const response = await api.get(`/benefits/${id}`);
      return response.data || {};
    },
    create: async (data: any): Promise<any> => {
      const response = await api.post('/benefits', data);
      return response.data || {};
    },
    update: async (id: number, data: any): Promise<any> => {
      const response = await api.put(`/benefits/${id}`, data);
      return response.data || {};
    },
    delete: async (id: number): Promise<any> => {
      const response = await api.delete(`/benefits/${id}`);
      return response.data || {};
    },
  },
  payrolls: {
    getAll: async (): Promise<any[]> => {
      const response = await api.get('/payrolls');
      return response.data as any[] || [];
    },
    getById: async (id: number): Promise<any> => {
      const response = await api.get(`/payrolls/${id}`);
      return response.data || {};
    },
    create: async (data: any): Promise<any> => {
      const response = await api.post('/payrolls', data);
      return response.data || {};
    },
    update: async (id: number, data: any): Promise<any> => {
      const response = await api.put(`/payrolls/${id}`, data);
      return response.data || {};
    },
    delete: async (id: number): Promise<any> => {
      const response = await api.delete(`/payrolls/${id}`);
      return response.data || {};
    },
    process: async (id: number): Promise<any> => {
      const response = await api.patch(`/payrolls/${id}/process`);
      return response.data || {};
    },
  },
  disciplinary: {
    getAll: async (): Promise<any[]> => {
      const response = await api.get('/disciplinary');
      return response.data as any[] || [];
    },
    getById: async (id: number): Promise<any> => {
      const response = await api.get(`/disciplinary/${id}`);
      return response.data || {};
    },
    create: async (data: any): Promise<any> => {
      const response = await api.post('/disciplinary', data);
      return response.data || {};
    },
    update: async (id: number, data: any): Promise<any> => {
      const response = await api.put(`/disciplinary/${id}`, data);
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
      return response.data as any[] || [];
    },
    getById: async (id: number): Promise<any> => {
      const response = await api.get(`/health-insurance/${id}`);
      return response.data || {};
    },
    create: async (data: any): Promise<any> => {
      const response = await api.post('/health-insurance', data);
      return response.data || {};
    },
    update: async (id: number, data: any): Promise<any> => {
      const response = await api.put(`/health-insurance/${id}`, data);
      return response.data || {};
    },
    delete: async (id: number): Promise<any> => {
      const response = await api.delete(`/health-insurance/${id}`);
      return response.data || {};
    },
  },
  compliance: {
    getAll: async (): Promise<any[]> => {
      const response = await api.get('/compliance');
      return response.data as any[] || [];
    },
    getById: async (id: number): Promise<any> => {
      const response = await api.get(`/compliance/${id}`);
      return response.data || {};
    },
    create: async (data: any): Promise<any> => {
      const response = await api.post('/compliance', data);
      return response.data || {};
    },
    update: async (id: number, data: any): Promise<any> => {
      const response = await api.put(`/compliance/${id}`, data);
      return response.data || {};
    },
    delete: async (id: number): Promise<any> => {
      const response = await api.delete(`/compliance/${id}`);
      return response.data || {};
    },
  },
  performance: {
    getAll: async (): Promise<any[]> => {
      const response = await api.get('/performance');
      return response.data as any[] || [];
    },
    getById: async (id: number): Promise<any> => {
      const response = await api.get(`/performance/${id}`);
      return response.data || {};
    },
    create: async (data: any): Promise<any> => {
      const response = await api.post('/performance', data);
      return response.data || {};
    },
    update: async (id: number, data: any): Promise<any> => {
      const response = await api.put(`/performance/${id}`, data);
      return response.data || {};
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
  },
};

export default api;