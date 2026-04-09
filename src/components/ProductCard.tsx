'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  featured: boolean;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useAppStore((s) => s.addToCart);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      stock: product.stock,
    });
    setAdded(true);
    toast.success(`${product.name} ajouté au panier`, {
      description: `${product.price.toLocaleString('fr-FR')} CFA`,
      icon: <ShoppingBag className="w-4 h-4" />,
    });
    setTimeout(() => setAdded(false), 1500);
  };

  const outOfStock = product.stock <= 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-sage-100/60"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-sage-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Featured Badge */}
        {product.featured && (
          <Badge className="absolute top-3 left-3 bg-gold text-white font-medium shadow-md border-0">
            <Star className="w-3 h-3 mr-1" />
            Vedette
          </Badge>
        )}

        {/* Out of Stock Overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-sage-800 font-bold px-4 py-2 rounded-full text-sm">
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <div className="mb-2">
          <span className="text-xs font-medium text-sage-400 uppercase tracking-wider">
            {product.category === 'cheveux' ? 'Cheveux' : 'Peau'}
          </span>
        </div>
        <h3 className="font-semibold text-sage-800 text-sm sm:text-base leading-snug mb-1 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <p className="text-xs text-sage-500 line-clamp-2 mb-4 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-sage-800">
              {product.price.toLocaleString('fr-FR')}
            </span>
            <span className="text-sm text-sage-400 ml-1">CFA</span>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={outOfStock}
            size="sm"
            className={`rounded-full transition-all duration-300 ${
              added
                ? 'bg-green-500 hover:bg-green-500 text-white'
                : 'bg-sage-400 hover:bg-sage-500 text-white'
            }`}
          >
            <AnimatePresence mode="wait">
              {added ? (
                <motion.span
                  key="added"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-xs">Ajouter</span>
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
