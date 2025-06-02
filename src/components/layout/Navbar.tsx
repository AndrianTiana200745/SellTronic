import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, User, LogOut, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  return (
    <nav className="bg-selltronic-black text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold flex items-center">
            <span className="text-selltronic-red">Sell</span>
            <span>Tronic</span>
          </Link>

          {isAuthenticated && (
            <>
              <div className="hidden md:flex space-x-6">
                <Link to="/" className="hover:text-selltronic-red transition-colors">Home</Link>
                {!isAdmin && (
                  <Link to="/products" className="hover:text-selltronic-red transition-colors">Products</Link>
                )}
                {!isAdmin && (
                  <Link to="/account" className="hover:text-selltronic-red transition-colors">Account</Link>
                )}
                {isAdmin && (
                  <Link to="/admin/dashboard" className="hover:text-selltronic-red transition-colors">Admin Dashboard</Link>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="py-1 px-3 rounded text-selltronic-black text-sm w-40 lg:w-64"
                  />
                  <Search className="absolute right-2 top-1.5 h-4 w-4 text-gray-400" />
                </div>

                {!isAdmin && (
                  <>
                    <Link to="/favorites" className="hover:text-selltronic-red">
                      <Heart size={20} />
                    </Link>
                    <Link to="/cart" className="hover:text-selltronic-red relative">
                      <ShoppingCart size={20} />
                      {totalItems > 0 && (
                        <span className="absolute -top-2 -right-2 bg-selltronic-red text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                          {totalItems}
                        </span>
                      )}
                    </Link>
                  </>
                )}

                <div className="flex items-center">
                  <div className="hidden md:block mr-2 text-sm">
                    <span className="text-gray-300">Bonjour,</span> {user?.name}
                    {!isAdmin && (
                      <div className="text-xs text-selltronic-red">
                        Balance: {user?.balance} Ariary
                      </div>
                    )}
                  </div>

                  {/* User icon with clickable dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={toggleDropdown}
                      className="flex items-center focus:outline-none"
                    >
                      <User size={20} />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                        <Link
                          to="/account"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Account Settings
                        </Link>
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            logout();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <div className="flex items-center">
                            <LogOut size={16} className="mr-2" />
                            Sign Out
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {!isAuthenticated && (
            <div className="flex space-x-4">
              <Link to="/login" className="py-2 px-4 bg-selltronic-red text-white rounded hover:bg-opacity-90 transition-colors">
                Login
              </Link>
              <Link to="/register" className="py-2 px-4 border border-selltronic-red text-selltronic-red rounded hover:bg-selltronic-red hover:text-white transition-colors">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
