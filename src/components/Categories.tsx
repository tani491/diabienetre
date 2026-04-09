'use client';

import { motion } from 'framer-motion';
import { Scissors, Sparkles } from 'lucide-react';
import { useAppStore, type Page } from '@/lib/store';

interface CategoriesProps {
  onNavigate: (page: Page) => void;
}

const categories = [
  {
    id: 'cheveux',
    label: 'Cheveux',
    description: 'Huiles, beurres et soins capillaires naturels pour des cheveux forts et éclatants.',
    icon: Scissors,
    image: '/product-hair-1.png',
    color: 'from-sage-400 to-sage-600',
  },
  {
    id: 'peau',
    label: 'Peau',
    description: 'Sérums, crèmes et gommages pour une peau lumineuse et nourrie.',
    icon: Sparkles,
    image: '/product-skin-1.png',
    color: 'from-gold to-amber-600',
  },
];

export default function Categories({ onNavigate }: CategoriesProps) {
  const setSelectedCategory = useAppStore((s) => s.setSelectedCategory);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    onNavigate('catalog');
  };

  return (
    <section id="categories-section" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-sage-400 font-medium text-sm tracking-wider uppercase">
            Nos gammes
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-sage-800 mt-2">
            Nos Catégories
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="w-12 h-0.5 bg-sage-300 rounded-full" />
            <span className="w-2 h-2 bg-gold rounded-full" />
            <span className="w-12 h-0.5 bg-sage-300 rounded-full" />
          </div>
        </motion.div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {categories.map((cat, index) => {
            const Icon = cat.icon;
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategoryClick(cat.id)}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer text-left"
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-75 group-hover:opacity-80 transition-opacity`} />
                </div>

                {/* Content */}
                <div className="relative z-10 p-8 sm:p-10 min-h-[280px] flex flex-col justify-end">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{cat.label}</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{cat.description}</p>
                  <div className="mt-4 flex items-center text-white/90 text-sm font-medium group-hover:text-white transition-colors">
                    Explorer
                    <svg
                      className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
