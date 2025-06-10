import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Shield, Package, RefreshCw } from 'lucide-react';
import { getProduct } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const product = getProduct(id || '');
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  
  if (!product) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <Link 
            to="/products"
            className="bg-selltronic-red text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
          >
            Browse Products
          </Link>
        </div>
        <Footer />
      </div>
    );
  }
  
  const favorite = isFavorite(product.id);
  
  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez-vous connecter pour ajouter dans le panier'
      });
      navigate('/login');
      return;
    }
    const { id, name, price, image } = product;
    
    for (let i = 0; i < quantity; i++) {
      addToCart({ id, name, price, image });
    }
    
    toast({
      title: 'Ajouté au panier',
      description: `${quantity} x ${product.name} a été ajouté à votre panier.`
    });
  };
  
  const handleFavoriteToggle = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez-vous connecter pour ajouter dans les favoris"
      });
      navigate('/login');
      return;
    }
    if (favorite) {
      removeFromFavorites(product.id);
      toast({
        title: 'Retiré des favoris',
        description: `${product.name} retiré de vos favoris`,
      });
    } else {
      addToFavorites(product);
      toast({
        title: 'Ajouté aux favoris',
        description: `${product.name} ajouté à vos favoris`,
      });
    }
  };
  
  return (
    <div>
      <Navbar />
      
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <nav className="text-sm mb-8">
            <ol className="list-none p-0 inline-flex">
              <li className="flex items-center">
                <Link to="/" className="text-gray-500 hover:text-selltronic-red">Home</Link>
                <span className="mx-2 text-gray-500">/</span>
              </li>
              <li className="flex items-center">
                <Link to="/products" className="text-gray-500 hover:text-selltronic-red">Products</Link>
                <span className="mx-2 text-gray-500">/</span>
              </li>
              <li className="text-selltronic-red">{product.name}</li>
            </ol>
          </nav>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Product Image */}
              <div className="p-6 flex items-center justify-center">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="max-w-full h-auto object-contain max-h-96"
                />
              </div>
              
              {/* Product Details */}
              <div className="p-6 border-t md:border-t-0 md:border-l border-gray-200">
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                
                <div className="text-2xl font-bold text-selltronic-red mb-4">
                  {product.price} Ariary
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-700">{product.description}</p>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <span className="font-medium mr-2">Availability:</span>
                    {product.stock > 0 ? (
                      <span className="text-green-600">In Stock ({product.stock} left)</span>
                    ) : (
                      <span className="text-red-600">Out of Stock</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Category:</span>
                    <Link 
                      to={`/products?category=${product.category}`}
                      className="text-selltronic-red hover:underline"
                    >
                      {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                    </Link>
                  </div>
                </div>
                
                {product.stock > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Quantity:</span>
                      <div className="flex items-center border border-gray-300 rounded">
                        <button 
                          className="px-3 py-1 border-r border-gray-300"
                          onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          min="1" 
                          max={product.stock}
                          value={quantity} 
                          onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value))))}
                          className="w-14 text-center py-1 border-none focus:outline-none"
                        />
                        <button 
                          className="px-3 py-1 border-l border-gray-300"
                          onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`flex items-center px-6 py-3 rounded font-medium ${
                      product.stock > 0 
                        ? 'bg-selltronic-red text-white hover:bg-opacity-90' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    } transition-colors`}
                  >
                    <ShoppingCart size={20} className="mr-2" />
                    Add to Cart
                  </button>
                  
                  <button
                    onClick={handleFavoriteToggle}
                    className={`flex items-center px-4 py-3 rounded font-medium ${
                      favorite 
                        ? 'bg-gray-100 text-selltronic-red border border-selltronic-red' 
                        : 'border border-gray-300 hover:border-selltronic-red hover:text-selltronic-red'
                    } transition-colors`}
                  >
                    <Heart 
                      size={20} 
                      className={`mr-2 ${favorite ? 'fill-selltronic-red' : ''}`}
                    />
                    {favorite ? 'Saved' : 'Save'}
                  </button>
                </div>
                
                {/* Features */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <Shield size={18} className="text-selltronic-red mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">1 Year Warranty</h4>
                        <p className="text-xs text-gray-500">Full coverage</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Package size={18} className="text-selltronic-red mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">Free Shipping</h4>
                        <p className="text-xs text-gray-500">On orders over $50</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <RefreshCw size={18} className="text-selltronic-red mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">30 Days Return</h4>
                        <p className="text-xs text-gray-500">Hassle-free returns</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;