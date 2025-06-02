
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const Login = () => {
  const [activeTab, setActiveTab] = useState<'buyer' | 'admin'>('buyer');
  
  return (
    <div>
      <Navbar />
      
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Bienvenue</h1>
            <p className="text-gray-600 mt-2">Connectez-vous à votre compte</p>
          </div>
          
          <Tabs
            defaultValue="buyer"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'buyer' | 'admin')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="buyer">Acheteur</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
            
            <TabsContent value="buyer">
              <LoginForm role="buyer" />
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Vous n'avez pas de compte ?{' '}
                  <Link to="/register" className="text-selltronic-red hover:underline">
                    S'inscrire
                  </Link>
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="admin">
              <LoginForm role="admin" />
              <div className="mt-6 text-sm text-gray-500 text-center">
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;