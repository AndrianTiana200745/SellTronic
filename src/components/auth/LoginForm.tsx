
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  role: 'buyer' | 'admin';
}

const LoginForm: React.FC<LoginFormProps> = ({ role }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Login en attente avec :", {email, password: "***"});
      await login(email, password, role);
      toast({
        title: 'Success',
        description: 'You have successfully logged in',
      });
      navigate(role === 'admin' ? '/admin/dashboard' : '/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid email or password',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-selltronic-red focus:border-transparent"
          placeholder="Entrer votre email"
          required
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-selltronic-red focus:border-transparent"
          placeholder="Entrer votre mot de passe"
          required
        />
      </div>
      
      <div>
        <button
          type="submit"
          className="w-full bg-selltronic-red text-white py-2 px-4 rounded hover:bg-opacity-90 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Connection...' : 'Se connecter'}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;