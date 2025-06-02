
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const favorite = isFavorite(product.id);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if(!isAuthenticated){
      toast({
        title : "Connection Requis",
        description : "Veuillez-vous connecter pour ajouter dans le pannier",
        variant : "destructive" 
      });
      navigate('/login');
      return;
    }
    const {id, name, price, image} = product;
    addToCart({ id, name, price, image });
    toast({
      title : "Ajouter au pannier",
      description : `${name} ajouter dans le pannier`,
    });
  };
  
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({
        title : "Connection requis",
        description : "Veuillez-vous connecter pour ajouter dans le favoris",
        variant : "destructive"
      });
      navigate('/login');
      return;
    }
      if(favorite){
      removeFromFavorites(product.id);
      toast({
        title : "Retirer des favoris",
        description : `${product.name} est retiré des favoris`,
      });
    }else {
      addToFavorites(product);
      toast({
        title : "Ajouter dans le favoris",
        description : `${product.name} ajouter dans le favoris`,
      });
    }
  };
  
  return (
    <Link to={`/product/${product.id}`}>
      <div className="product-card group transition-all duration-300 relative">
        <div className="h-48 overflow-hidden bg-gray-100">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <span className="bg-selltronic-red text-white px-3 py-1 rounded-sm text-sm font-medium">
                Rupture de stock
              </span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg truncate">{product.name}</h3>
          <p className="text-selltronic-red font-bold mt-1">{product.price} Ariary</p>
          
          <div className="flex justify-between mt-3">
            <button 
              onClick={handleAddToCart}
              className="flex items-center bg-selltronic-black hover:bg-selltronic-red text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={product.stock === 0}
            >
              <ShoppingCart size={16} className="mr-1" />
              Ajouter au panier
            </button>
            
            <button 
              onClick={handleFavoriteToggle}
              className="flex items-center p-1 rounded hover:text-selltronic-red transition-colors"
            >
              <Heart 
                size={20} 
                className={favorite ? "fill-selltronic-red text-selltronic-red" : ""} 
              />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;