import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getOrdersByUser } from '@/data/products';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const Account = () => {
  const { user, addFunds, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fundAmount, setFundAmount] = useState(100);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) return <div>Chargement...</div>;
  if (!user) return null; // Redirection déjà faite

  const orders = getOrdersByUser(user.id);

  const handleAddFunds = () => {
    addFunds(fundAmount);
    toast({
      title: 'Fonds ajoutés',
      description: `${fundAmount} Ariary ont été ajoutés à votre compte`,
    });
  };

  return (
    <div>
      <Navbar />
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Mon compte</h1>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profil</TabsTrigger>
                <TabsTrigger value="orders">Commandes</TabsTrigger>
                <TabsTrigger value="balance">Solde</TabsTrigger>
              </TabsList>
              {/* Profile Tab */}
              <TabsContent value="profile" className="p-6">
                <h2 className="text-xl font-semibold mb-4">Information du profil</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom Complet
                    </label>
                    <input
                      type="text"
                      value={user.name}
                      readOnly
                      className="w-full p-2 bg-gray-50 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse Email
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      readOnly
                      className="w-full p-2 bg-gray-50 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de compte
                    </label>
                    <input
                      type="text"
                      value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      readOnly
                      className="w-full p-2 bg-gray-50 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Solde actuel
                    </label>
                    <input
                      type="text"
                      value={`${user.balance} Ariary`}
                      readOnly
                      className="w-full p-2 bg-gray-50 border border-gray-300 rounded"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Paramètres du compte</h3>
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors mr-2"
                  >
                    Mettre à jour le profil
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                  >
                    Changer de mot de passe
                  </button>
                </div>
              </TabsContent>
              {/* Orders Tab */}
              <TabsContent value="orders" className="p-6">
                <h2 className="text-xl font-semibold mb-4">Mes commandes</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="mb-4">Vous n'avez pas encore passé de commande.</p>
                    <button
                      onClick={() => navigate('/products')}
                      className="bg-selltronic-red text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
                    >
                      Commencer mes achats
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Commande ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
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
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {order.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {new Date(order.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {order.total.toFixed(2)} Ariary
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs rounded ${
                                order.status === 'delivered' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-selltronic-red">
                              <button className="hover:underline">Voir Details</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
              {/* Balance Tab */}
              <TabsContent value="balance" className="p-6">
                <h2 className="text-xl font-semibold mb-4">Solde du compte</h2>
                <div className="bg-gray-50 p-4 rounded mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-500">Votre solde actuel</div>
                      <div className="text-3xl font-bold">{user.balance} Ariary</div>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                      Valide
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Ajout de fonds</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <button 
                        onClick={() => setFundAmount(5000)}
                        className={`border p-3 rounded text-center hover:border-selltronic-red transition-colors ${
                          fundAmount === 5000 ? 'border-selltronic-red text-selltronic-red' : 'border-gray-300'
                        }`}
                      >
                        5000 Ar
                      </button>
                      <button 
                        onClick={() => setFundAmount(10000)}
                        className={`border p-3 rounded text-center hover:border-selltronic-red transition-colors ${
                          fundAmount === 10000 ? 'border-selltronic-red text-selltronic-red' : 'border-gray-300'
                        }`}
                      >
                        10000 Ar
                      </button>
                      <button 
                        onClick={() => setFundAmount(200000)}
                        className={`border p-3 rounded text-center hover:border-selltronic-red transition-colors ${
                          fundAmount === 200000 ? 'border-selltronic-red text-selltronic-red' : 'border-gray-300'
                        }`}
                      >
                        200000 Ar
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Montant Personnalisé (in Ariary)
                      </label>
                      <input
                        type="number"
                        value={fundAmount}
                        onChange={(e) => setFundAmount(Number(e.target.value))}
                        min="1000"
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-selltronic-red focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={handleAddFunds}
                      className="w-full bg-selltronic-red text-white py-2 px-4 rounded hover:bg-opacity-90 transition-colors"
                    >
                      Ajouter des fonds
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <p>
                    Note: Dans une application réelle, cela se connecterait à une passerelle de paiement.
                    À des fins de démonstration, les fonds sont ajoutés directement.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Account;
