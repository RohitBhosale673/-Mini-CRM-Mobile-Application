import { Lead } from '@/types';

class LeadService {
  private baseUrl = 'http://localhost:3000';

  async getLeads(customerId?: string, status?: string): Promise<Lead[]> {
    let url = `${this.baseUrl}/leads`;
    const params = new URLSearchParams();

    if (customerId) {
      params.append('customer_id', customerId);
    }
    if (status) {
      params.append('status', status);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch leads');
    }
    return response.json();
  }

  async getLeadById(id: string): Promise<Lead> {
    const response = await fetch(`${this.baseUrl}/leads/${id}`);
    if (!response.ok) {
      throw new Error('Lead not found');
    }
    return response.json();
  }

  async createLead(leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> {
    const newLead = {
      ...leadData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const response = await fetch(`${this.baseUrl}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newLead),
    });

    if (!response.ok) {
      throw new Error('Failed to create lead');
    }
    return response.json();
  }

  async updateLead(id: string, leadData: Partial<Lead>): Promise<Lead> {
    const updatedData = {
      ...leadData,
      updated_at: new Date().toISOString(),
    };

    const response = await fetch(`${this.baseUrl}/leads/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error('Failed to update lead');
    }
    return response.json();
  }

  async deleteLead(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/leads/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete lead');
    }
  }
}

export const leadService = new LeadService();
