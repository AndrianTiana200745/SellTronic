
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { categories, products } from '@/data/products';
import CategoryCard from '@/components/ui/CategoryCard';
import ProductCard from '@/components/products/ProductCard';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const Index = () => {
  const navigate = useNavigate();
  const featuredProducts = products.slice(0, 4);
  const newArrivals = products.slice(4, 8);

  return (
    <div>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-selltronic-black text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-selltronic-black to-transparent z-10"></div>
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" 
            alt="Electronics" 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        
        <div className="container mx-auto px-4 py-24 relative z-20">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Technologie de nouvelle génération à portée de main
            </h1>
            <p className="text-lg mb-8 text-gray-200">
              Découvrez les derniers produits électroniques et gadgets à des prix compétitifs.
              Des smartphones aux accessoires de jeu, nous avons tout ce qu'il vous faut.
              </p>
            <div className="flex space-x-4">
              <button 
                onClick={() => navigate('/products')}
                className="bg-selltronic-red text-white px-6 py-3 rounded hover:bg-opacity-90 transition-colors"
              >
                Voir maintenant
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="border border-white px-6 py-3 rounded hover:bg-white hover:text-selltronic-black transition-colors"
              >
                Rejoignez SellTronic
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Acheter par Catégorie</h2>
            <button 
              onClick={() => navigate('/products')}
              className="flex items-center text-selltronic-red hover:underline"
            >
              Voir toutes les categories <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Produits en vedette</h2>
            <button 
              onClick={() => navigate('/products')}
              className="flex items-center text-selltronic-red hover:underline"
            >
              Voir tous les produits <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Banner */}
      <section className="py-16 bg-selltronic-red text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Offre special</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Inscrivez-vous aujourd'hui et obtenez un crédit de 5 000 Ariary sur votre premier achat ! Offre limitée.
          </p>
          <button 
            onClick={() => navigate('/register')}
            className="bg-white text-selltronic-red px-6 py-3 rounded font-medium hover:bg-gray-100 transition-colors"
          >
            Inscrivez-vous maintenant
          </button>
        </div>
      </section>
      
      {/* New Arrivals */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Nouveautés</h2>
            <button 
              onClick={() => navigate('/products')}
              className="flex items-center text-selltronic-red hover:underline"
            >
              Voir tout <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-selltronic-red text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Produits de qualité</h3>
              <p className="text-gray-600">Nous proposons des produits électroniques de haute qualité de marques de confiance.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-selltronic-red text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Livraison rapide</h3>
              <p className="text-gray-600">Recevez vos commandes rapidement et efficacement.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-selltronic-red text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Paiements sécurisés</h3>
              <p className="text-gray-600">Vos transactions sont sûres et sécurisées avec nous.</p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;