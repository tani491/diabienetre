'use client';

import { ArrowRight, Phone, Mail, MapPin, Instagram, Music2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-sage-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="DiaBienEtre" className="w-6 h-6 object-contain" />
              </div>
              <div>
                <span className="text-lg font-bold">DiaBienEtre</span>
                <span className="block text-xs text-white/60">Beauté & Bien-être</span>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Votre destination pour des produits capillaires et soins de la peau 100% naturels. Sublimez votre beauté au quotidien avec nos soins d&apos;exception.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://www.instagram.com/diabienetre/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram DiaBienEtre"
                className="relative w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <svg aria-hidden="true" width="0" height="0" className="absolute">
                  <defs>
                    <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#F58529" />
                      <stop offset="35%" stopColor="#DD2A7B" />
                      <stop offset="70%" stopColor="#8134AF" />
                      <stop offset="100%" stopColor="#515BD4" />
                    </linearGradient>
                  </defs>
                </svg>
                <Instagram className="w-4 h-4" color="url(#instagram-gradient)" />
              </a>
              <a
                href="https://www.tiktok.com/@gakou47"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok DiaBienEtre @gakou47"
                className="w-9 h-9 bg-white rounded-lg flex items-center justify-center hover:bg-white/90 transition-colors"
              >
                <Music2 className="w-4 h-4 text-black" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-4">
              Navigation
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  Accueil
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  Catalogue
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  Produits Cheveux
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  Produits Peau
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-4">
              Nos Produits
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  Huiles Capillaires
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  Beurres Naturels
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  Sérums Visage
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  Crèmes & Gommages
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-4">
              Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <div>
                  <span className="text-white text-sm font-medium">Wave</span>
                  <span className="block text-white/60 text-sm">775278596</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <span className="text-white/60 text-sm">contact@diabienetre.sn</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <span className="text-white/60 text-sm">Dakar, Sénégal</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center">
            <p className="text-white/40 text-sm">
              © 2026 DiaBienEtre - Tous droits réservés
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
