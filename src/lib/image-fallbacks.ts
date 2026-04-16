const productFallbacks: Record<string, string> = {
  telephones: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80",
  ordinateurs: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&q=80",
  audio: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80",
  default: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80",
};

const categoryFallbacks: Record<string, string> = {
  telephones: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80",
  ordinateurs: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&q=80",
  audio: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80",
  accessoires: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200&q=80",
  default: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200&q=80",
};

function normalizeKey(value?: string | null) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function getCategoryFallbackImage(categorySlug?: string | null, categoryName?: string | null) {
  const key = normalizeKey(categorySlug || categoryName);

  if (key.includes("telephone")) return categoryFallbacks.telephones;
  if (key.includes("ordinateur")) return categoryFallbacks.ordinateurs;
  if (key.includes("audio")) return categoryFallbacks.audio;
  if (key.includes("accessoire")) return categoryFallbacks.accessoires;

  return categoryFallbacks.default;
}

export function getProductImage(product: {
  imageUrl?: string | null;
  categoryName?: string | null;
  brand?: string | null;
  name?: string | null;
}) {
  if (product.imageUrl) return product.imageUrl;

  const key = normalizeKey(`${product.categoryName} ${product.brand} ${product.name}`);

  if (key.includes("telephone") || key.includes("iphone") || key.includes("samsung")) {
    return productFallbacks.telephones;
  }

  if (key.includes("ordinateur") || key.includes("laptop") || key.includes("pc") || key.includes("macbook")) {
    return productFallbacks.ordinateurs;
  }

  if (key.includes("audio") || key.includes("casque") || key.includes("ecouteur") || key.includes("speaker")) {
    return productFallbacks.audio;
  }

  return productFallbacks.default;
}
