'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore, type Page } from '@/lib/store';

interface CartPageProps {
  onNavigate: (page: Page) => void;
}

export default function Cart({ onNavigate }: CartPageProps) {
  const cart = useAppStore((s) => s.cart);
  const updateQuantity = useAppStore((s) => s.updateQuantity);
  const removeFromCart = useAppStore((s) => s.removeFromCart);
  const cartTotal = useAppStore((s) => s.cartTotal);
  const cartCount = useAppStore((s) => s.cartCount);

  if (cart.length === 0) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-9 h-9 text-sage-300" />
            </div>
            <h1 className="text-2xl font-bold text-sage-800 mb-3">
              Votre panier est vide
            </h1>
            <p className="text-sage-500 mb-8">
              Découvrez nos produits et ajoutez vos favoris au panier
            </p>
            <Button
              onClick={() => onNavigate('catalog')}
              className="bg-sage-400 hover:bg-sage-500 text-white rounded-full px-8"
            >
              Découvrir nos produits
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-sage-800 mb-2">
            Mon Panier
          </h1>
          <p className="text-sage-500">
            {cartCount()} article{cartCount() !== 1 ? 's' : ''} dans votre panier
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-sage-100/60 mb-4"
                >
                  {/* Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-sage-50 shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sage-800 text-sm sm:text-base truncate">
                      {item.name}
                    </h3>
                    <span className="text-xs text-sage-400 uppercase tracking-wider">
                      {item.category === 'cheveux' ? 'Cheveux' : 'Peau'}
                    </span>
                    <div className="mt-2 text-sage-700 font-bold">
                      {item.price.toLocaleString('fr-FR')} CFA
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-sage-400 hover:text-red-500 transition-colors cursor-pointer p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 bg-sage-50 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-sage-500 hover:text-sage-700 hover:bg-sage-100 rounded-l-lg transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-sage-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-sage-500 hover:text-sage-700 hover:bg-sage-100 rounded-r-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-sage-100/60 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-sage-800 mb-6">
                Résumé de la commande
              </h2>

              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-sage-600 truncate mr-2">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-sage-800 font-medium shrink-0">
                      {(item.price * item.quantity).toLocaleString('fr-FR')} CFA
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-sage-100 pt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-base font-semibold text-sage-800">Total</span>
                  <span className="text-xl font-bold text-sage-800">
                    {cartTotal().toLocaleString('fr-FR')} CFA
                  </span>
                </div>

                <Button
                  onClick={() => onNavigate('checkout')}
                  className="w-full bg-gold hover:bg-gold/90 text-white font-semibold py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Passer la commande
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
