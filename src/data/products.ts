
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  stock: number;
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

export const categories: Category[] = [
  { 
    id: 'smartphones', 
    name: 'Smartphones', 
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02ff9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' 
  },
  { 
    id: 'laptops', 
    name: 'Laptops', 
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' 
  },
  { 
    id: 'accessories', 
    name: 'Accessories', 
    image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' 
  },
  { 
    id: 'components', 
    name: 'PC Components', 
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' 
  },
  { 
    id: 'tablets', 
    name: 'Tablets', 
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' 
  },
  { 
    id: 'audio', 
    name: 'Audio', 
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' 
  },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Ultra Smartphone X1',
    price: 4400000,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02ff9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    category: 'smartphones',
    description: 'Latest generation smartphone with 6.7-inch display, 128GB storage, and triple camera system.',
    stock: 15
  },
  {
    id: '2',
    name: 'ProBook Laptop 15"',
    price: 6240000,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    category: 'laptops',
    description: 'Powerful laptop with 16GB RAM, 512GB SSD, and dedicated graphics card.',
    stock: 10
  },
  {
    id: '3',
    name: 'Wireless Earbuds Pro',
    price: 650000,
    image: 'https://images.unsplash.com/photo-1605464315542-bda3e2f4e605?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    category: 'accessories',
    description: 'True wireless earbuds with active noise cancellation and 24 hour battery life.',
    stock: 25
  },
  {
    id: '4',
    name: 'Gaming Mouse RGB',
    price: 300000,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    category: 'accessories',
    description: 'High-precision gaming mouse with customizable RGB lighting and programmable buttons.',
    stock: 30
  },
  {
    id: '5',
    name: 'Graphics Card RTX 4000',
    price: 4000000,
    image: 'https://images.unsplash.com/photo-1591489378430-ef2f4c0f4a48?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    category: 'components',
    description: 'Next-gen graphics card with ray tracing capabilities and 12GB GDDR6 memory.',
    stock: 7
  },
  {
    id: '6',
    name: 'Pro Tablet 11"',
    price: 3200000,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    category: 'tablets',
    description: 'High-performance tablet with 11-inch display, 128GB storage, and all-day battery life.',
    stock: 12
  },
  {
    id: '7',
    name: 'Bluetooth Speaker',
    price: 400000,
    image: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    category: 'audio',
    description: 'Portable Bluetooth speaker with 20 hours of playtime and waterproof design.',
    stock: 20
  },
  {
    id: '8',
    name: 'Smart Watch 5',
    price: 1500000,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    category: 'accessories',
    description: 'Advanced smartwatch with health monitoring, GPS, and 3-day battery life.',
    stock: 15
  },
];

export const getProductsByCategory = (categoryId: string): Product[] => {
  return products.filter(product => product.category === categoryId);
};

export const getProduct = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getCategories = (): Category[] => {
  return categories;
};

// Mock order handling functions
export interface Order {
  id: string;
  products: { id: string; quantity: number }[];
  total: number;
  status: 'pending' | 'delivered';
  date: string;
  userId: string;
}

let orders: Order[] = [];

export const createOrder = (userId: string, items: { id: string, quantity: number }[], total: number) => {
  // Get existing orders from localStorage or initialize empty array
  const existingOrders = localStorage.getItem('selltronic-orders') 
    ? JSON.parse(localStorage.getItem('selltronic-orders') || '[]') 
    : [];
  
  // Create new order
  const newOrder = {
    id: `order-${Date.now()}`,
    userId,
    products: items,
    total,
    date: new Date().toISOString(),
    status: 'pending'
  };
  
  // Add new order to existing orders
  const updatedOrders = [...existingOrders, newOrder];
  
  // Save to localStorage
  localStorage.setItem('selltronic-orders', JSON.stringify(updatedOrders));
  
  return newOrder;
};

export const getOrdersByUser = (userId: string) => {
  const allOrders = localStorage.getItem('selltronic-orders') 
    ? JSON.parse(localStorage.getItem('selltronic-orders') || '[]') 
    : [];
  
  return allOrders.filter((order: any) => order.userId === userId);
};

export const getAllOrders = (): Order[] => {
  return orders;
};

export const setOrderDelivered = (orderId: string): void => {
  orders = orders.map(order => 
    order.id === orderId 
      ? { ...order, status: 'delivered' } 
      : order
  );
};

// Mock product management functions
export const addProduct = (product: Omit<Product, 'id'>): Product => {
  const newProduct = {
    ...product,
    id: `prod-${Date.now()}`
  };
  
  products.push(newProduct);
  return newProduct;
};

export const updateProduct = (id: string, updates: Partial<Product>): Product => {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Product not found');
  
  products[index] = {
    ...products[index],
    ...updates
  };
  
  return products[index];
};

export const deleteProduct = (id: string): void => {
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products.splice(index, 1);
  }
};