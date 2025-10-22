import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Customer, CustomerState } from '@/types';
import { customerService } from '@/services/customerService';

interface CustomerContextType extends CustomerState {
  fetchCustomers: (page?: number, search?: string) => Promise<void>;
  createCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  selectCustomer: (customer: Customer | null) => void;
  setSearchQuery: (query: string) => void;
  resetCustomers: () => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

type CustomerAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CUSTOMERS'; payload: { customers: Customer[]; hasMore: boolean; page: number } }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'SELECT_CUSTOMER'; payload: Customer | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET_CUSTOMERS' };

const customerReducer = (state: CustomerState, action: CustomerAction): CustomerState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CUSTOMERS':
      return {
        ...state,
        customers: action.payload.page === 1 ? action.payload.customers : [...state.customers, ...action.payload.customers],
        hasMore: action.payload.hasMore,
        currentPage: action.payload.page,
        isLoading: false,
        error: null,
      };
    case 'ADD_CUSTOMER':
      return {
        ...state,
        customers: [action.payload, ...state.customers],
      };
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map(c => c.id === action.payload.id ? action.payload : c),
        selectedCustomer: state.selectedCustomer?.id === action.payload.id ? action.payload : state.selectedCustomer,
      };
    case 'DELETE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.filter(c => c.id !== action.payload),
        selectedCustomer: state.selectedCustomer?.id === action.payload ? null : state.selectedCustomer,
      };
    case 'SELECT_CUSTOMER':
      return { ...state, selectedCustomer: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'RESET_CUSTOMERS':
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

const initialState: CustomerState = {
  customers: [],
  selectedCustomer: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  currentPage: 0,
  hasMore: true,
};

export const CustomerProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(customerReducer, initialState);

  const fetchCustomers = async (page = 1, search = state.searchQuery) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await customerService.getCustomers(page, search);
      dispatch({ 
        type: 'SET_CUSTOMERS', 
        payload: { 
          customers: result.customers, 
          hasMore: result.hasMore,
          page 
        } 
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch customers' });
    }
  };

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const customer = await customerService.createCustomer(customerData);
      dispatch({ type: 'ADD_CUSTOMER', payload: customer });
    } catch (error) {
      throw new Error('Failed to create customer');
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      const customer = await customerService.updateCustomer(id, customerData);
      dispatch({ type: 'UPDATE_CUSTOMER', payload: customer });
    } catch (error) {
      throw new Error('Failed to update customer');
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await customerService.deleteCustomer(id);
      dispatch({ type: 'DELETE_CUSTOMER', payload: id });
    } catch (error) {
      throw new Error('Failed to delete customer');
    }
  };

  const selectCustomer = (customer: Customer | null) => {
    dispatch({ type: 'SELECT_CUSTOMER', payload: customer });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const resetCustomers = () => {
    dispatch({ type: 'RESET_CUSTOMERS' });
  };

  return (
    <CustomerContext.Provider value={{
      ...state,
      fetchCustomers,
      createCustomer,
      updateCustomer,
      deleteCustomer,
      selectCustomer,
      setSearchQuery,
      resetCustomers,
    }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = (): CustomerContextType => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
};