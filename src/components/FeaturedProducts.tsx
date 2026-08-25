'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import ProductCard from '@/components/ProductCard';
import { type Page } from '@/lib/store';
import { fetchPublicProducts, type Product } from '@/lib/products';

interface FeaturedProductsProps {
  onNavigate: (page: Page) => void;
}

export default function FeaturedProducts({ onNavigate }: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchPublicProducts()
      .then((products) => setProducts(products.filter((p) => p.featured)))
      .catch((error) => {
        console.error(error);
        setProducts([]);
      });
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-sage-50/50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12"
        >
          <div>
            <span className="text-gold font-medium text-sm tracking-wider uppercase flex items-center gap-1.5">
              <Star className="w-4 h-4" />
              Sélection spéciale
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-sage-800 mt-2">
              Produits Vedettes
            </h2>
            <p className="text-sage-500 mt-2">
              Nos best-sellers sélectionnés pour vous
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => onNavigate('catalog')}
            className="mt-4 sm:mt-0 text-sage-600 hover:text-sage-800 hover:bg-sage-100 group"
          >
            Voir tout
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Carousel */}
        <div className="relative max-w-5xl mx-auto">
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {products.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="pl-4 basis-[80%] sm:basis-[50%] lg:basis-[33.333%]"
                >
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex -left-12 bg-white border-sage-200 text-sage-600 hover:bg-sage-50 hover:text-sage-800" />
            <CarouselNext className="hidden sm:flex -right-12 bg-white border-sage-200 text-sage-600 hover:bg-sage-50 hover:text-sage-800" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
