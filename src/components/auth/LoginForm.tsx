<<<<<<< HEAD
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        login({
          id: data.id, // récupère l'id ici
          email,
          role: data.role,
          name: data.name,
          balance: data.balance // si tu veux le solde aussi
        });
        if (data.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/products');
        }
        toast({ title: 'Succès', description: 'Connexion réussie' });
      } else {
        toast({ title: 'Erreur', description: data.error || 'Erreur lors de la connexion', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erreur', description: 'Erreur serveur', variant: 'destructive' });
=======

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
>>>>>>> 1e8cdff7d5aeeba9382d0347a3d3767d54423e74
    } finally {
      setIsLoading(false);
    }
  };
<<<<<<< HEAD

=======
  
>>>>>>> 1e8cdff7d5aeeba9382d0347a3d3767d54423e74
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
<<<<<<< HEAD
=======
      
>>>>>>> 1e8cdff7d5aeeba9382d0347a3d3767d54423e74
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
<<<<<<< HEAD
=======
      
>>>>>>> 1e8cdff7d5aeeba9382d0347a3d3767d54423e74
      <div>
        <button
          type="submit"
          className="w-full bg-selltronic-red text-white py-2 px-4 rounded hover:bg-opacity-90 transition-colors"
          disabled={isLoading}
        >
<<<<<<< HEAD
          {isLoading ? 'Connexion...' : 'Se connecter'}
=======
          {isLoading ? 'Connection...' : 'Se connecter'}
>>>>>>> 1e8cdff7d5aeeba9382d0347a3d3767d54423e74
        </button>
      </div>
    </form>
  );
};

export default LoginForm;