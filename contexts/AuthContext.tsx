import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User } from '@/types';
import { authService } from '@/services/authService';
import { storageService } from '@/services/storageService';
import { router } from 'expo-router';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTH'; payload: { user: User; token: string } }
  | { type: 'CLEAR_AUTH' }
  | { type: 'SET_ERROR'; payload: string };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_AUTH':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'CLEAR_AUTH':
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true, // Set to true to indicate auth state is being checked on mount
  isAuthenticated: false,
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const checkAuthState = async () => {
    console.log('AuthContext: checkAuthState - starting');
    try {
      const token = await storageService.getItem('authToken');
      const userStr = await storageService.getItem('user');
      
      console.log('AuthContext: checkAuthState - token:', token ? 'found' : 'not found');
      console.log('AuthContext: checkAuthState - userStr:', userStr ? 'found' : 'not found');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        dispatch({ type: 'SET_AUTH', payload: { user, token } });
        console.log('AuthContext: checkAuthState - SET_AUTH dispatched');
      } else {
        dispatch({ type: 'CLEAR_AUTH' }); // Clear auth and set isLoading to false
        console.log('AuthContext: checkAuthState - CLEAR_AUTH dispatched');
      }
    } catch (error) {
      console.error('AuthContext: Error checking auth state:', error);
      dispatch({ type: 'CLEAR_AUTH' }); // Clear auth and set isLoading to false on error
    } finally {
      console.log('AuthContext: checkAuthState - finished');
    }
  };

  useEffect(() => {
    checkAuthState();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { user, token } = await authService.login(email, password);
      
      await storageService.setItem('authToken', token);
      await storageService.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'SET_AUTH', payload: { user, token } });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { user, token } = await authService.register(email, password, name);
      
      await storageService.setItem('authToken', token);
      await storageService.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'SET_AUTH', payload: { user, token } });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await storageService.removeItem('authToken');
      await storageService.removeItem('user');
      dispatch({ type: 'CLEAR_AUTH' });
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
