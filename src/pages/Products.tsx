
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '@/components/products/ProductGrid';
import { products, categories, getProductsByCategory } from '@/data/products';
import { Filter, SlidersHorizontal } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const Products = () => {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryId);
  const [priceRange, setPriceRange] = useState<[number, number]>([1000, 20000000]);
  const [sortBy, setSortBy] = useState('featured');
  
  useEffect(() => {
    let result = [...products];
    
    // Filter by category if selected
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }
    
    // Filter by price range
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    
    // Sort results
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    }
    
    setFilteredProducts(result);
  }, [selectedCategory, priceRange, sortBy]);
  
  return (
    <div>
      <Navbar />
      
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <nav className="text-sm mb-8">
            <ol className="list-none p-0 inline-flex">
              <li className="flex items-center">
                <a href="/" className="text-gray-500 hover:text-selltronic-red">Home</a>
                <span className="mx-2 text-gray-500">/</span>
              </li>
              <li className="text-selltronic-red">Products</li>
            </ol>
          </nav>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="w-full lg:w-1/4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg flex items-center">
                    <Filter size={18} className="mr-2" /> 
                    Filtre
                  </h2>
                  <button className="text-sm text-selltronic-red hover:underline">
                    Effacer Tout
                  </button>
                </div>
                
                {/* Categories */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Categories</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="all-categories"
                        type="radio"
                        name="category"
                        checked={selectedCategory === null}
                        onChange={() => setSelectedCategory(null)}
                        className="h-4 w-4 text-selltronic-red focus:ring-selltronic-red"
                      />
                      <label htmlFor="all-categories" className="ml-2 text-sm text-gray-700">
                        Toutes Categories
                      </label>
                    </div>
                    
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center">
                        <input
                          id={category.id}
                          type="radio"
                          name="category"
                          checked={selectedCategory === category.id}
                          onChange={() => setSelectedCategory(category.id)}
                          className="h-4 w-4 text-selltronic-red focus:ring-selltronic-red"
                        />
                        <label htmlFor={category.id} className="ml-2 text-sm text-gray-700">
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Ranger de Prix</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
                
                {/* Stock Status */}
                <div>
                  <h3 className="font-medium mb-2">Status du stock</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="in-stock"
                        type="checkbox"
                        className="h-4 w-4 text-selltronic-red focus:ring-selltronic-red rounded"
                      />
                      <label htmlFor="in-stock" className="ml-2 text-sm text-gray-700">
                        In Stock
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="out-of-stock"
                        type="checkbox"
                        className="h-4 w-4 text-selltronic-red focus:ring-selltronic-red rounded"
                      />
                      <label htmlFor="out-of-stock" className="ml-2 text-sm text-gray-700">
                        Out of Stock
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Products */}
            <div className="w-full lg:w-3/4">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-gray-600">Showing {filteredProducts.length} products</span>
                </div>
                <div className="flex items-center">
                  <label htmlFor="sort" className="text-sm mr-2 text-gray-600">Trier par:</label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-selltronic-red focus:border-transparent"
                  >
                    <option value="featured">En vedette</option>
                    <option value="price-low">Prix: Du moins cher au plus cher</option>
                    <option value="price-high">Prix: Du plus cher au moins cher</option>
                  </select>
                </div>
              </div>
              
              {filteredProducts.length > 0 ? (
                <ProductGrid products={filteredProducts} />
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold mb-2">Aucun produit trouvé</h3>
                  <p className="text-gray-600">Essayez d'ajuster vos filtres</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Products;