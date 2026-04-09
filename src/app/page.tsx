'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore, type Page } from '@/lib/store';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import FeaturedProducts from '@/components/FeaturedProducts';
import Catalog from '@/components/Catalog';
import Cart from '@/components/Cart';
import Checkout from '@/components/Checkout';
import Admin from '@/components/Admin';
import Footer from '@/components/Footer';
import OrderConfirmation from '@/components/OrderConfirmation';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function Home() {
  const currentPage = useAppStore((s) => s.currentPage);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Secret admin access via ?admin=true
  const searchParams = useSearchParams();
  const adminRedirected = useRef(false);
  useEffect(() => {
    if (searchParams.get('admin') === 'true' && !adminRedirected.current) {
      adminRedirected.current = true;
      setCurrentPage('admin');
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams, setCurrentPage]);

  // Reset to home if on confirmation page but no lastOrderId
  const lastOrderId = useAppStore((s) => s.lastOrderId);
  useEffect(() => {
    if (currentPage === 'confirmation' && !lastOrderId) {
      setCurrentPage('home');
    }
  }, [currentPage, lastOrderId, setCurrentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
            <Hero onNavigate={handleNavigate} />
            <Categories onNavigate={handleNavigate} />
            <FeaturedProducts onNavigate={handleNavigate} />
          </motion.div>
        );
      case 'catalog':
        return (
          <motion.div key="catalog" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
            <Catalog />
          </motion.div>
        );
      case 'cart':
        return (
          <motion.div key="cart" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
            <Cart onNavigate={handleNavigate} />
          </motion.div>
        );
      case 'checkout':
        return (
          <motion.div key="checkout" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
            <Checkout onNavigate={handleNavigate} />
          </motion.div>
        );
      case 'admin':
        return (
          <motion.div key="admin" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
            <Admin onNavigate={handleNavigate} />
          </motion.div>
        );
      case 'confirmation':
        return (
          <motion.div key="confirmation" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
            <OrderConfirmation onNavigate={handleNavigate} />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onNavigate={handleNavigate} />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {renderPage()}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
