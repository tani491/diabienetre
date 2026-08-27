"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, BadgePercent, Check, ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

interface ProductDetailsProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  gallery: string[];
  category: string;
  stock: number;
  featured: boolean;
  isPromo: boolean;
}

interface ProductDetailsProps {
  product: ProductDetailsProduct;
}

function buildGalleryImages(product: ProductDetailsProduct) {
  const extraImages = product.gallery
    .filter((image) => image.trim().length > 0)
    .slice(0, 4);

  if (extraImages.length === 0) {
    return Array.from({ length: 4 }, () => product.image);
  }

  return [product.image, ...extraImages];
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const router = useRouter();
  const addToCart = useAppStore((s) => s.addToCart);
  const [added, setAdded] = useState(false);
  const images = useMemo(() => buildGalleryImages(product), [product]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] ?? product.image;
  const outOfStock = product.stock <= 0;

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
      description: `${product.price.toLocaleString("fr-FR")} CFA`,
      icon: <ShoppingBag className="w-4 h-4" />,
      duration: 2000,
    });
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <section className="bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 -ml-3 rounded-full text-sage-600 hover:bg-sage-50 hover:text-sage-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <section className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <div>
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-sage-50 shadow-sm">
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
              {product.isPromo && (
                <Badge className="absolute right-4 top-4 bg-red-500 text-white border-0 shadow-md">
                  <BadgePercent className="w-3.5 h-3.5 mr-1" />
                  En promo
                </Badge>
              )}
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`relative aspect-square overflow-hidden rounded-xl border bg-sage-50 transition-all ${
                    selectedIndex === index
                      ? "border-sage-500 ring-2 ring-sage-200"
                      : "border-sage-100 hover:border-sage-300"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:pt-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-sage-200 text-sage-600">
                {product.category === "cheveux" ? "Cheveux" : "Peau"}
              </Badge>
              {product.featured && (
                <Badge className="bg-gold text-white border-0">
                  <Star className="w-3.5 h-3.5 mr-1 fill-white" />
                  Vedette
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold leading-tight text-sage-800 sm:text-4xl">
              {product.name}
            </h1>

            <p className="mt-5 text-3xl font-bold text-sage-900">
              {product.price.toLocaleString("fr-FR")}
              <span className="ml-2 text-base font-medium text-sage-400">CFA</span>
            </p>

            <div className="mt-6 rounded-xl bg-white p-5 text-sm leading-7 text-sage-600 shadow-sm border border-sage-100">
              {product.description}
            </div>

            <div className="mt-6 flex items-center justify-between rounded-xl bg-sage-50 px-4 py-3 text-sm">
              <span className="font-medium text-sage-700">Disponibilité</span>
              <span className={outOfStock ? "text-red-600" : "text-green-600"}>
                {outOfStock ? "Rupture de stock" : `${product.stock} en stock`}
              </span>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={outOfStock}
              size="lg"
              className={`mt-8 w-full rounded-full py-6 text-base font-semibold ${
                added
                  ? "bg-green-500 hover:bg-green-500 text-white"
                  : "bg-sage-500 hover:bg-sage-600 text-white"
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Ajouté au panier
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Ajouter au panier
                </>
              )}
            </Button>
          </div>
        </section>
      </div>
    </section>
  );
}
