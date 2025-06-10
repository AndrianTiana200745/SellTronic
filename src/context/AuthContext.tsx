<<<<<<< HEAD
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type User = {
  id: string; // <--- ajoute ceci
  email: string;
  role: 'buyer' | 'admin';
  name?: string;
  balance?: number; // Ajoute balance ici
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  addFunds: (amount: number) => void; // Ajoute addFunds ici
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Ajoute cette fonction pour gérer l'ajout de fonds
  const addFunds = (amount: number) => {
    if (user) {
      const updatedUser = { ...user, balance: (user.balance || 0) + amount };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, addFunds }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
=======
import React, { createContext, useState, useContext, useEffect } from 'react';

type UserRole = 'buyer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  balance: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  addFunds: (amount: number) => Promise<void>;
  updateBalance: (newBalance: number) => void;
  getAllUsers: () => User[];
}

// Mock users for demo purposes
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    balance: 1000
  },
  {
    id: '2',
    name: 'Test User',
    email: 'user@example.com',
    role: 'buyer',
    balance: 500
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([...MOCK_USERS]);
  
  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('selltronic-user');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Load users from localStorage if available
    const savedUsers = localStorage.getItem('selltronic-users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Initialize with mock users if not found
      localStorage.setItem('selltronic-users', JSON.stringify(users));
    }
  }, []);

  // Save users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('selltronic-users', JSON.stringify(users));
  }, [users]);

  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    // For demo, just find a matching user by email and role
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    
    if (!foundUser) {
      throw new Error('Invalid credentials');
    }
    
    // In a real app, you'd verify the password here
    // For demo purposes, we'll just accept any password
    
    // Update user in state
    setUser(foundUser);
    
    // Save user to localStorage
    localStorage.setItem('selltronic-user', JSON.stringify(foundUser));
    // For demo, we also set a token
    localStorage.setItem('selltronic-token', 'mock-token-' + Date.now());
  };
  
  const register = async (name: string, email: string, password: string): Promise<void> => {
    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already in use');
    }
    
    // Create new user
    const newUser: User = {
      id: String(users.length + 1),
      name,
      email,
      role: 'buyer', // Default role is buyer
      balance: 100 // Starting balance
    };
    
    // Add to users array
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    // Set as current user
    setUser(newUser);
    
    // Save to localStorage
    localStorage.setItem('selltronic-users', JSON.stringify(updatedUsers));
    localStorage.setItem('selltronic-user', JSON.stringify(newUser));
    localStorage.setItem('selltronic-token', 'mock-token-' + Date.now());
  };
  
  const logout = () => {
    localStorage.removeItem('selltronic-token');
    localStorage.removeItem('selltronic-user');
    setUser(null);
  };
  
  const addFunds = async (amount: number): Promise<void> => {
    if (!user) {
      throw new Error('Authentication required');
    }
    
    const updatedUser = {
      ...user,
      balance: user.balance + amount
    };
    
    // Update user in state
    setUser(updatedUser);
    
    // Update user in users array
    const updatedUsers = users.map(u => 
      u.id === user.id ? updatedUser : u
    );
    setUsers(updatedUsers);
    
    // Save to localStorage
    localStorage.setItem('selltronic-user', JSON.stringify(updatedUser));
    localStorage.setItem('selltronic-users', JSON.stringify(updatedUsers));
  };
  
  const updateBalance = (newBalance: number): void => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      balance: newBalance
    };
    
    // Update user in state
    setUser(updatedUser);
    
    // Update user in users array
    const updatedUsers = users.map(u => 
      u.id === user.id ? updatedUser : u
    );
    setUsers(updatedUsers);
    
    // Save to localStorage
    localStorage.setItem('selltronic-user', JSON.stringify(updatedUser));
    localStorage.setItem('selltronic-users', JSON.stringify(updatedUsers));
  };
  
  const getAllUsers = (): User[] => {
    return users;
  };
  
  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    addFunds,
    updateBalance,
    getAllUsers
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
>>>>>>> 1e8cdff7d5aeeba9382d0347a3d3767d54423e74
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
