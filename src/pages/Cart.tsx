
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createOrder } from '@/data/products';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleCheckout = () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to checkout',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }
    
    if (user.balance < totalPrice) {
      toast({
        title: 'Insufficient Funds',
        description: `You need to add $${(totalPrice - user.balance).toFixed(2)} more to your account`,
        variant: 'destructive'
      });
      navigate('/account');
      return;
    }
    
    const orderItems = items.map(item => ({
      id: item.id,
      quantity: item.quantity
    }));
    
    createOrder(user.id, orderItems, totalPrice);
    
    toast({
      title: 'Order Placed',
      description: 'Your order has been successfully placed!',
    });
    
    clearCart();
    navigate('/account');
  };
  
  if (items.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="mb-6">
            <ShoppingCart size={64} className="mx-auto text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link 
            to="/products"
            className="bg-selltronic-red text-white px-6 py-3 rounded hover:bg-opacity-90 transition-colors"
          >
            Start Shopping
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
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="w-full lg:w-2/3">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
                    <h2 className="text-xl font-semibold">Cart Items ({items.length})</h2>
                    <button 
                      onClick={clearCart}
                      className="text-sm text-selltronic-red hover:underline flex items-center"
                    >
                      <Trash size={16} className="mr-1" />
                      Clear Cart
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center py-4 border-b border-gray-100">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-medium">
                                <Link 
                                  to={`/product/${item.id}`}
                                  className="hover:text-selltronic-red"
                                >
                                  {item.name}
                                </Link>
                              </h3>
                              <p className="mt-1 text-sm text-gray-500">
                                ${item.price} each
                              </p>
                            </div>
                            <p className="font-semibold">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center border border-gray-300 rounded">
                              <button 
                                className="px-3 py-1 border-r border-gray-300"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                -
                              </button>
                              <span className="w-10 text-center py-1">{item.quantity}</span>
                              <button 
                                className="px-3 py-1 border-l border-gray-300"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                            
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-sm text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{totalPrice.toFixed(2)} Ariary</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>Free</span>
                  </div>
                  
                  <div className="border-t border-gray-200 my-3"></div>
                  
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-selltronic-red">{totalPrice.toFixed(2)} Ariary</span>
                  </div>
                </div>
                
                {user && (
                  <div className="bg-gray-50 p-3 rounded mb-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Account Balance:</span>
                      <span className="font-semibold">{user.balance} Ariary</span>
                    </div>
                    {user.balance < totalPrice && (
                      <div className="text-xs text-red-500">
                        You need {(totalPrice - user.balance).toFixed(2)} Ariary more in your account to complete this purchase.
                      </div>
                    )}
                  </div>
                )}
                
                <button
                  onClick={handleCheckout}
                  className="w-full bg-selltronic-red text-white py-3 rounded font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center"
                >
                  Checkout <ArrowRight size={16} className="ml-2" />
                </button>
                
                <div className="mt-6">
                  <Link 
                    to="/products"
                    className="text-sm text-selltronic-red hover:underline flex items-center justify-center"
                  >
                    Continue Shopping
                  </Link>
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

export default Cart;