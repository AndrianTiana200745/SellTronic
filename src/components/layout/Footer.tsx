import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-selltronic-darkGray text-gray-300">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="text-2xl font-bold flex items-center mb-4">
              <span className="text-selltronic-red">Sell</span>
              <span className="text-white">Tronic</span>
            </Link>
            <p className="mb-4">
              Votre destination unique pour tous les produits électroniques et technologiques.
              Des produits de qualité à des prix compétitifs.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-selltronic-red transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-selltronic-red transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-selltronic-red transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-selltronic-red transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Categories</h3>
            <ul className="space-y-2">
              <li><Link to="/products?category=smartphones" className="hover:text-selltronic-red transition-colors">Smartphones</Link></li>
              <li><Link to="/products?category=laptops" className="hover:text-selltronic-red transition-colors">Laptops</Link></li>
              <li><Link to="/products?category=accessories" className="hover:text-selltronic-red transition-colors">Accessories</Link></li>
              <li><Link to="/products?category=components" className="hover:text-selltronic-red transition-colors">PC Components</Link></li>
              <li><Link to="/products?category=tablets" className="hover:text-selltronic-red transition-colors">Tablets</Link></li>
              <li><Link to="/products?category=audio" className="hover:text-selltronic-red transition-colors">Audio</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Service client</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-selltronic-red transition-colors">Contacter nous</a></li>
              <li><a href="#" className="hover:text-selltronic-red transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-selltronic-red transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-selltronic-red transition-colors">Returns & Refunds</a></li>
              <li><a href="#" className="hover:text-selltronic-red transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-selltronic-red transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin size={18} className="mr-2 text-selltronic-red" />
                <span>BI 36 Mandrosoa Ilafy</span>
              </div>
              <div className="flex items-center">
                <Phone size={18} className="mr-2 text-selltronic-red" />
                <span>+261 34 81 278 09</span>
              </div>
              <div className="flex items-center">
                <Mail size={18} className="mr-2 text-selltronic-red" />
                <span>andrynarcicio@gmail.com</span>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2 text-white">Abonnez-vous à notre newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="py-2 px-3 rounded-l outline-none text-selltronic-black w-full"
                />
                <button className="bg-selltronic-red text-white py-2 px-4 rounded-r hover:bg-opacity-90 transition-colors">
                  S'abonner
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm">
          <p>&copy; 2025 SellTronic. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;