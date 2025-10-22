import { Customer } from '@/types';

class CustomerService {
  private baseUrl = 'http://localhost:3000';

  async getCustomers(page = 1, search = ''): Promise<{ customers: Customer[]; hasMore: boolean }> {
    let url = `${this.baseUrl}/customers?_page=${page}&_limit=10`;
    if (search) {
      url += `&q=${search}`; // JSON Server uses 'q' for full-text search
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch customers');
    }
    const customers = await response.json();

    // For hasMore, we'd typically check a Link header or total count from the API
    // For JSON Server, we can make an extra call or assume if we get 10 items, there might be more
    const totalCount = parseInt(response.headers.get('X-Total-Count') || '0', 10);
    const hasMore = (page * 10) < totalCount;

    return { customers, hasMore };
  }

  async getCustomerById(id: string): Promise<Customer> {
    const response = await fetch(`${this.baseUrl}/customers/${id}`);
    if (!response.ok) {
      throw new Error('Customer not found');
    }
    return response.json();
  }

  async createCustomer(customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    const newCustomer = {
      ...customerData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const response = await fetch(`${this.baseUrl}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCustomer),
    });

    if (!response.ok) {
      throw new Error('Failed to create customer');
    }
    return response.json();
  }

  async updateCustomer(id: string, customerData: Partial<Customer>): Promise<Customer> {
    const updatedData = {
      ...customerData,
      updated_at: new Date().toISOString(),
    };

    const response = await fetch(`${this.baseUrl}/customers/${id}`, {
      method: 'PATCH', // Use PATCH for partial updates
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error('Failed to update customer');
    }
    return response.json();
  }

  async deleteCustomer(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/customers/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete customer');
    }
  }
}

export const customerService = new CustomerService();
