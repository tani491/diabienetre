export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  gallery?: string[];
  category: string;
  stock: number;
  featured: boolean;
  isPromo: boolean;
}

function normalizeProducts(payload: unknown): Product[] {
  if (Array.isArray(payload)) {
    return payload as Product[];
  }

  if (payload && typeof payload === "object") {
    const { products, data } = payload as { products?: unknown; data?: unknown };

    if (Array.isArray(products)) {
      return products as Product[];
    }

    if (Array.isArray(data)) {
      return data as Product[];
    }
  }

  return [];
}

function getErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const { error, message } = payload as { error?: unknown; message?: unknown };

  if (typeof error === "string") {
    return error;
  }

  if (typeof message === "string") {
    return message;
  }

  return null;
}

export async function fetchPublicProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  const payload: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(getErrorMessage(payload) ?? `Failed to fetch products (${res.status})`);
  }

  return normalizeProducts(payload);
}
