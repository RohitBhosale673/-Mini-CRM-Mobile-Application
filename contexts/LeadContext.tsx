import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Lead, LeadState } from '@/types';
import { leadService } from '@/services/leadService';

interface LeadContextType extends LeadState {
  fetchLeads: (customerId?: string) => Promise<void>;
  createLead: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateLead: (id: string, lead: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  selectLead: (lead: Lead | null) => void;
  setStatusFilter: (status: Lead['status'] | 'All') => void;
  resetLeads: () => void;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

type LeadAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LEADS'; payload: Lead[] }
  | { type: 'ADD_LEAD'; payload: Lead }
  | { type: 'UPDATE_LEAD'; payload: Lead }
  | { type: 'DELETE_LEAD'; payload: string }
  | { type: 'SELECT_LEAD'; payload: Lead | null }
  | { type: 'SET_STATUS_FILTER'; payload: Lead['status'] | 'All' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET_LEADS' };

const leadReducer = (state: LeadState, action: LeadAction): LeadState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_LEADS':
      return {
        ...state,
        leads: action.payload,
        isLoading: false,
        error: null,
      };
    case 'ADD_LEAD':
      return {
        ...state,
        leads: [action.payload, ...state.leads],
      };
    case 'UPDATE_LEAD':
      return {
        ...state,
        leads: state.leads.map(l => l.id === action.payload.id ? action.payload : l),
        selectedLead: state.selectedLead?.id === action.payload.id ? action.payload : state.selectedLead,
      };
    case 'DELETE_LEAD':
      return {
        ...state,
        leads: state.leads.filter(l => l.id !== action.payload),
        selectedLead: state.selectedLead?.id === action.payload ? null : state.selectedLead,
      };
    case 'SELECT_LEAD':
      return { ...state, selectedLead: action.payload };
    case 'SET_STATUS_FILTER':
      return { ...state, statusFilter: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'RESET_LEADS':
      return initialState;
    default:
      return state;
  }
};

const initialState: LeadState = {
  leads: [],
  selectedLead: null,
  isLoading: false,
  error: null,
  statusFilter: 'All',
};

export const LeadProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(leadReducer, initialState);

  const fetchLeads = async (customerId?: string, status?: Lead['status'] | 'All') => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const leads = await leadService.getLeads(customerId, status === 'All' ? undefined : status);
      dispatch({ type: 'SET_LEADS', payload: leads });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch leads' });
    }
  };

  const createLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const lead = await leadService.createLead(leadData);
      dispatch({ type: 'ADD_LEAD', payload: lead });
    } catch (error) {
      throw new Error('Failed to create lead');
    }
  };

  const updateLead = async (id: string, leadData: Partial<Lead>) => {
    try {
      const lead = await leadService.updateLead(id, leadData);
      dispatch({ type: 'UPDATE_LEAD', payload: lead });
    } catch (error) {
      throw new Error('Failed to update lead');
    }
  };

  const deleteLead = async (id: string) => {
    try {
      await leadService.deleteLead(id);
      dispatch({ type: 'DELETE_LEAD', payload: id });
    } catch (error) {
      throw new Error('Failed to delete lead');
    }
  };

  const selectLead = (lead: Lead | null) => {
    dispatch({ type: 'SELECT_LEAD', payload: lead });
  };

  const setStatusFilter = (status: Lead['status'] | 'All') => {
    dispatch({ type: 'SET_STATUS_FILTER', payload: status });
  };

  const resetLeads = () => {
    dispatch({ type: 'RESET_LEADS' });
  };

  return (
    <LeadContext.Provider value={{
      ...state,
      fetchLeads,
      createLead,
      updateLead,
      deleteLead,
      selectLead,
      setStatusFilter,
      resetLeads,
    }}>
      {children}
    </LeadContext.Provider>
  );
};

export const useLeads = (): LeadContextType => {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
};
