import { notFound } from "next/navigation";
import ProductDetails from "@/components/ProductDetails";
import ProductPageShell from "@/components/ProductPageShell";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await db.product.findFirst({
    where: { id, active: true },
    select: {
      name: true,
      description: true,
    },
  });

  if (!product) {
    return {
      title: "Produit introuvable - DiaBienEtre",
    };
  }

  return {
    title: `${product.name} - DiaBienEtre`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const [product, settings] = await Promise.all([
    db.product.findFirst({
      where: { id, active: true },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image: true,
        gallery: true,
        category: true,
        stock: true,
        featured: true,
        isPromo: true,
      },
    }),
    db.storeSettings.findUnique({
      where: { id: "main" },
      select: { logoUrl: true },
    }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductPageShell logoUrl={settings?.logoUrl ?? null}>
      <ProductDetails product={product} />
    </ProductPageShell>
  );
}
