import React, { createContext, useState, useContext, useEffect } from 'react';
import { Product } from '@/data/products';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface FavoritesContextType {
  favorites: Product[];
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (id: string) => boolean;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated && user) {
      // Load favorites from localStorage for the specific user
      const savedFavorites = localStorage.getItem(`selltronic-favorites-${user.id}`);
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } else {
      // Clear favorites when logged out
      setFavorites([]);
    }
  }, [isAuthenticated, user]);
  
  // Save to localStorage whenever favorites change
  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem(`selltronic-favorites-${user.id}`, JSON.stringify(favorites));
    }
  }, [favorites, isAuthenticated, user]);
  
  const addToFavorites = (product: Product) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to add items to favorites",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    if (favorites.some(item => item.id === product.id)) {
      return; // Already in favorites
    }
    
    // Update UI
    setFavorites(prev => [...prev, product]);
    
    toast({
      title: "Added to Favorites",
      description: `${product.name} has been added to your favorites`,
    });
  };
  
  const removeFromFavorites = (id: string): boolean => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to manage favorites",
        variant: "destructive"
      });
      navigate('/login');
      return false;
    }
    
    const initialLength = favorites.length;
    
    // Update UI
    setFavorites(prev => prev.filter(item => item.id !== id));
    
    return favorites.length !== initialLength;
  };
  
  const isFavorite = (id: string) => {
    return favorites.some(item => item.id === id);
  };
  
  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite
  };
  
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
