// pages/ProductCatalog.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, ShoppingCart } from 'lucide-react';

const ProductCatalog = () => {
  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
        <p className="text-gray-600">Browse and shop our amazing products</p>
      </motion.div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Product cards will go here */}
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Product catalog content will go here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;