<<<<<<< HEAD
import React, { useEffect } from 'react';
=======

import React from 'react';
>>>>>>> 1e8cdff7d5aeeba9382d0347a3d3767d54423e74
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import ProductGrid from '@/components/products/ProductGrid';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
<<<<<<< HEAD
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Favorites = () => {
  const { favorites } = useFavorites();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) return <div>Chargement...</div>;
  if (!user) return null;

=======

const Favorites = () => {
  const { favorites } = useFavorites();
  
>>>>>>> 1e8cdff7d5aeeba9382d0347a3d3767d54423e74
  if (favorites.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="mb-6">
            <Heart size={64} className="mx-auto text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Your Favorites List is Empty</h1>
          <p className="mb-8">You haven't added any products to your favorites list yet.</p>
          <Link 
            to="/products"
            className="bg-selltronic-red text-white px-6 py-3 rounded hover:bg-opacity-90 transition-colors"
          >
            Browse Products
          </Link>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div>
      <Navbar />
      
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Your Favorites</h1>
            <div className="text-gray-600">
              {favorites.length} {favorites.length === 1 ? 'item' : 'items'}
            </div>
          </div>
          
          <ProductGrid products={favorites} />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Favorites;