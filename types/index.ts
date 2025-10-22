export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  customer_id: string;
  title: string;
  description: string;
  status: 'New' | 'Contacted' | 'Converted' | 'Lost';
  value: number;
  created_at: string;
  updated_at: string;
  customer?: Customer;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface CustomerState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  currentPage: number;
  hasMore: boolean;
}

export interface LeadState {
  leads: Lead[];
  selectedLead: Lead | null;
  isLoading: boolean;
  error: string | null;
  statusFilter: Lead['status'] | 'All';
}

export interface DashboardStats {
  totalLeads: number;
  totalValue: number;
  leadsByStatus: {
    New: number;
    Contacted: number;
    Converted: number;
    Lost: number;
  };
  totalCustomers: number;
}
