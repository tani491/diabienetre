'use client';

import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore, type Page } from '@/lib/store';

interface OrderConfirmationProps {
  onNavigate: (page: Page) => void;
}

export default function OrderConfirmation({ onNavigate }: OrderConfirmationProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto text-center">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, duration: 0.5, type: 'spring' }}
          >
            <CheckCircle className="w-14 h-14 text-green-500" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-sage-800 mb-4">
            Commande confirmée !
          </h1>
          <p className="text-sage-500 mb-2 text-lg">
            Merci pour votre commande
          </p>
          <p className="text-sage-400 text-sm mb-10 max-w-md mx-auto">
            Votre commande a été enregistrée avec succès. Nous traiterons votre paiement et vous contacterons bientôt pour la livraison.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-sm border border-sage-100/60 p-6 mb-8"
        >
          <div className="space-y-3 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-sage-500">Statut</span>
              <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full text-xs">
                En attente de vérification
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-sage-500">Paiement</span>
              <span className="text-sage-700 font-medium">Via Wave</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={() => onNavigate('home')}
            className="bg-sage-400 hover:bg-sage-500 text-white rounded-full px-8"
          >
            Retour à l&apos;accueil
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
