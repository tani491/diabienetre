'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Phone,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore, type Page } from '@/lib/store';
import { toast } from 'sonner';

interface CheckoutPageProps {
  onNavigate: (page: Page) => void;
}

const steps = [
  { id: 1, label: 'Informations', icon: User },
  { id: 2, label: 'Récapitulatif', icon: Check },
  { id: 3, label: 'Paiement', icon: CreditCard },
];

export default function Checkout({ onNavigate }: CheckoutPageProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const cart = useAppStore((s) => s.cart);
  const cartTotal = useAppStore((s) => s.cartTotal);
  const clearCart = useAppStore((s) => s.clearCart);
  const setLastOrderId = useAppStore((s) => s.setLastOrderId);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    waveRef: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Le nom est requis';
    if (!form.phone.trim()) newErrors.phone = 'Le téléphone est requis';
    if (!form.address.trim()) newErrors.address = "L'adresse est requise";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!form.waveRef.trim()) {
      setErrors({ waveRef: 'La référence Wave est requise' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
          customerPhone: form.phone,
          customerAddress: form.address,
          items: cart,
          totalAmount: cartTotal(),
          waveRef: form.waveRef,
        }),
      });

      if (!response.ok) {
        throw new Error('Order failed');
      }

      const order = await response.json();
      setLastOrderId(order.id);
      clearCart();
      toast.success('Commande confirmée !');
      onNavigate('confirmation');
    } catch {
      toast.error('Erreur lors de la commande. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    onNavigate('cart');
    return null;
  }

  const totalAmount = cartTotal();

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-sage-800 mb-2">
            Commande
          </h1>
          <p className="text-sage-500">
            Finalisez votre commande en quelques étapes
          </p>
        </motion.div>

        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((s, index) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                          ? 'bg-sage-400 text-white shadow-lg scale-110'
                          : 'bg-sage-100 text-sage-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium mt-2 ${
                      isActive ? 'text-sage-800' : 'text-sage-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 sm:w-24 h-0.5 mx-2 sm:mx-4 rounded-full transition-all duration-300 ${
                      step > s.id ? 'bg-green-500' : 'bg-sage-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-sage-100/60 p-6 sm:p-8"
          >
            {/* Step 1: Customer Info */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-sage-800">
                  Vos informations
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sage-700 mb-1.5">
                      Nom complet *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400" />
                      <Input
                        id="name"
                        placeholder="Votre nom complet"
                        value={form.name}
                        onChange={(e) => {
                          setForm({ ...form, name: e.target.value });
                          if (errors.name) setErrors({ ...errors, name: '' });
                        }}
                        className={`pl-10 border-sage-200 focus:border-sage-400 focus:ring-sage-400/20 ${errors.name ? 'border-red-300' : ''}`}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sage-700 mb-1.5">
                      Téléphone *
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400" />
                      <Input
                        id="phone"
                        placeholder="77 000 00 00"
                        value={form.phone}
                        onChange={(e) => {
                          setForm({ ...form, phone: e.target.value });
                          if (errors.phone) setErrors({ ...errors, phone: '' });
                        }}
                        className={`pl-10 border-sage-200 focus:border-sage-400 focus:ring-sage-400/20 ${errors.phone ? 'border-red-300' : ''}`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-sage-700 mb-1.5">
                      Adresse de livraison *
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-sage-400" />
                      <Input
                        id="address"
                        placeholder="Votre adresse complète"
                        value={form.address}
                        onChange={(e) => {
                          setForm({ ...form, address: e.target.value });
                          if (errors.address)
                            setErrors({ ...errors, address: '' });
                        }}
                        className={`pl-10 border-sage-200 focus:border-sage-400 focus:ring-sage-400/20 ${errors.address ? 'border-red-300' : ''}`}
                      />
                    </div>
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Order Summary */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold text-sage-800 mb-6">
                  Récapitulatif de votre commande
                </h2>

                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 bg-sage-50 rounded-xl"
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-white shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sage-800 text-sm truncate">
                          {item.name}
                        </h4>
                        <span className="text-xs text-sage-500">
                          Quantité: {item.quantity}
                        </span>
                      </div>
                      <span className="font-semibold text-sage-800 text-sm shrink-0">
                        {(item.price * item.quantity).toLocaleString('fr-FR')}{' '}
                        CFA
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-sage-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-sage-600">
                    <span>Sous-total</span>
                    <span>{totalAmount.toLocaleString('fr-FR')} CFA</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-sage-800 pt-2">
                    <span>Total</span>
                    <span>{totalAmount.toLocaleString('fr-FR')} CFA</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-sage-50 rounded-xl">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-sage-500 mt-0.5 shrink-0" />
                    <div className="text-sm text-sage-600">
                      <span className="font-medium text-sage-800">{form.name}</span>
                      <br />
                      {form.phone}
                      <br />
                      {form.address}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Wave Payment */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-bold text-sage-800 mb-2">
                  Paiement via Wave
                </h2>
                <p className="text-sage-500 text-sm mb-6">
                  Effectuez votre paiement en envoyant le montant au numéro ci-dessous
                </p>

                <div className="bg-gradient-to-br from-sage-400 to-sage-600 rounded-2xl p-6 text-white mb-6">
                  <p className="text-sm text-white/80 mb-1">
                    Envoyez le montant à
                  </p>
                  <p className="text-3xl font-bold tracking-wide mb-1">775278596</p>
                  <p className="text-lg font-semibold text-gold">
                    {totalAmount.toLocaleString('fr-FR')} CFA
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="waveRef" className="text-sage-700 mb-1.5">
                      Référence de la transaction Wave *
                    </Label>
                    <Input
                      id="waveRef"
                      placeholder="Entrez la référence de votre paiement"
                      value={form.waveRef}
                      onChange={(e) => {
                        setForm({ ...form, waveRef: e.target.value });
                        if (errors.waveRef) setErrors({ ...errors, waveRef: '' });
                      }}
                      className={`border-sage-200 focus:border-sage-400 focus:ring-sage-400/20 ${errors.waveRef ? 'border-red-300' : ''}`}
                    />
                    {errors.waveRef && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.waveRef}
                      </p>
                    )}
                    <p className="text-xs text-sage-400 mt-1.5">
                      Vous trouverez cette référence dans votre historique de
                      transactions Wave
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-sage-100">
              {step > 1 ? (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="rounded-full border-sage-200 text-sage-600 hover:bg-sage-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => onNavigate('cart')}
                  className="rounded-full border-sage-200 text-sage-600 hover:bg-sage-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Panier
                </Button>
              )}

              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  className="rounded-full bg-sage-400 hover:bg-sage-500 text-white"
                >
                  Continuer
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="rounded-full bg-gold hover:bg-gold/90 text-white font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      Confirmer le paiement
                      <Check className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
