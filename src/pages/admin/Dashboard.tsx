
import React, { useState, useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getAllOrders, setOrderDelivered } from '@/data/products';
import { Check, Package, DollarSign, Users, ChevronRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

type UserType = {
  id: string;
  email: string;
  role: string;
  name?: string;
  // Ajoute d'autres champs si besoin
};

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [deliveredOrders, setDeliveredOrders] = useState<Set<string>>(new Set());
  const [allUsers, setAllUsers] = useState<UserType[]>([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/login');
    } 
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetch('/api/users')
        .then(res => res.json())
        .then(data => setAllUsers(data.users || []))
        .catch(() => setAllUsers([]));
    }
  }, [user]);

  if (loading) return <div>Chargement...</div>;

  const orders = getAllOrders ? getAllOrders() : [];
  const customerCount = allUsers.filter(u => u.role === 'buyer').length;
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);


  const handleDeliveryConfirm = (orderId: string) => {
    setOrderDelivered(orderId);
    setDeliveredOrders(prev => new Set(prev).add(orderId));
  };

  return (
    <div>
      <Navbar />
      
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>

          <p className="text-gray-500 mb-8">
            Bienvenue à vous, {user?.name || 'Admin'}
          </p>

          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Stats Cards */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-md">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">{orders.length}</h3>
                  <p className="text-sm text-gray-500">Total Commande</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-md">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">{totalSales.toFixed(2)} Ariary</h3>
                  <p className="text-sm text-gray-500">Total des ventes</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-md">
                  <Package className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">{pendingOrders.length}</h3>
                  <p className="text-sm text-gray-500">Commande en Cours</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-md">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">{allUsers.length}</h3>
                  <p className="text-sm text-gray-500">Total d'utilisateurs</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                to="/admin/products"
                className="flex justify-between items-center p-4 border border-gray-200 rounded-md hover:border-selltronic-red hover:text-selltronic-red transition-colors"
              >
                <span>Manage Products</span>
                <ChevronRight size={18} />
              </Link>
              
              <button 
                className="flex justify-between items-center p-4 border border-gray-200 rounded-md hover:border-selltronic-red hover:text-selltronic-red transition-colors"
              >
                <span>View Reports</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Commande recente</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No orders have been placed yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.userId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs rounded ${
                            deliveredOrders.has(order.id) || order.status === 'delivered'
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {deliveredOrders.has(order.id) || order.status === 'delivered'
                              ? 'Delivered' 
                              : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDeliveryConfirm(order.id)}
                            disabled={deliveredOrders.has(order.id) || order.status === 'delivered'}
                            className={`inline-flex items-center px-3 py-1 rounded ${
                              deliveredOrders.has(order.id) || order.status === 'delivered'
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            <Check size={16} className="mr-1" />
                            Confirm Delivery
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
