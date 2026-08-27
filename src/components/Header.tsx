'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShoppingBag, Menu, Home, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useAppStore, type Page } from '@/lib/store';

interface HeaderProps {
  onNavigate: (page: Page) => void;
  logoUrl?: string | null;
}

const navItems: { label: string; page: Page; icon: React.ReactNode }[] = [
  { label: 'Accueil', page: 'home', icon: <Home className="w-4 h-4" /> },
  { label: 'Catalogue', page: 'catalog', icon: <Grid3X3 className="w-4 h-4" /> },
];

export default function Header({ onNavigate, logoUrl }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const currentPage = useAppStore((s) => s.currentPage);
  const cartCount = useAppStore((s) =>
    s.cart.reduce((count, item) => count + item.quantity, 0)
  );
  const hasHydrated = useAppStore((s) => s._hasHydrated);
  const logoSrc = logoUrl?.trim() || "/logo.png";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-[var(--announcement-bar-height,0px)] z-[60] transition-all duration-300 ${
        scrolled
          ? 'bg-sage-400/95 backdrop-blur-md shadow-lg'
          : 'bg-sage-400 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <button
            onClick={() => {
              onNavigate('home');
              setMobileOpen(false);
            }}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md group-hover:bg-white/30 transition-all duration-200 overflow-hidden">
              <Image
                src={logoSrc}
                alt="DiaBienEtre"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-white tracking-tight leading-tight">
                DiaBienEtre
              </span>
              <span className="text-[10px] sm:text-xs text-white/80 -mt-0.5 tracking-wide">
                Beauté & Bien-être
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                  currentPage === item.page
                    ? 'bg-white text-sage-700 shadow-md'
                    : 'text-white/90 hover:text-white hover:bg-white/15'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {item.icon}
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          {/* Cart + Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate('cart')}
              className="relative text-white hover:bg-white/15 hover:text-white"
            >
              <ShoppingBag className="w-5 h-5" />
              {hasHydrated && cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gold text-white text-xs font-bold border-2 border-sage-400">
                  {cartCount}
                </Badge>
              )}
              <span className="sr-only">Panier</span>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/15">
                  <Menu className="w-5 h-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-white p-6">
                <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
                <div className="flex flex-col gap-2 mt-8">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-sage-100">
                    <div className="w-10 h-10 bg-sage-400 rounded-xl flex items-center justify-center overflow-hidden">
                      <Image
                        src={logoSrc}
                        alt="DiaBienEtre"
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <span className="text-lg font-bold text-sage-800">DiaBienEtre</span>
                      <span className="block text-xs text-sage-500">Beauté & Bien-être</span>
                    </div>
                  </div>
                  {navItems.map((item) => (
                    <button
                      key={item.page}
                      onClick={() => {
                        onNavigate(item.page);
                        setMobileOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        currentPage === item.page
                          ? 'bg-sage-100 text-sage-800'
                          : 'text-sage-600 hover:bg-sage-50'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      onNavigate('cart');
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-sage-600 hover:bg-sage-50 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Panier
                    {hasHydrated && cartCount > 0 && (
                      <Badge className="ml-auto bg-gold text-white">{cartCount}</Badge>
                    )}
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
