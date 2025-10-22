import { User } from '@/types';

// Mock API service - replace with actual API calls
class AuthService {
  private baseUrl = 'http://localhost:3001';
  
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${this.baseUrl}/users?email=${email}&password=${password}`);
    const users = await response.json();

    if (users.length > 0) {
      const user = users[0];
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          created_at: user.created_at,
        },
        token: `mock-jwt-token-${user.id}`, // Simple mock token
      };
    }
    throw new Error('Invalid credentials');
  }

  async register(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      password, // In a real app, hash this password
      name,
      role: 'user',
      created_at: new Date().toISOString(),
    };

    const response = await fetch(`${this.baseUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const user = await response.json();
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at,
      },
      token: `mock-jwt-token-${user.id}`,
    };
  }

  async refreshToken(token: string): Promise<{ token: string }> {
    // In a real app, this would call an API to refresh the token
    // For now, we'll just return the same token or a new mock one
    return {
      token: 'refreshed-jwt-token-' + Math.random().toString(36).substr(2, 9),
    };
  }
}

export const authService = new AuthService();
