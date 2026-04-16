import { Link } from "wouter";
import { Product } from "@/lib/api-client";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { toast } from "@/hooks/use-toast";
import { getProductImage } from "@/lib/image-fallbacks";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to detail page
    addToCart(product);
    toast({
      title: "Ajouté au panier",
      description: `${product.name} a été ajouté à votre panier.`,
      duration: 3000,
    });
  };

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative aspect-square bg-zinc-100 rounded-xl overflow-hidden mb-5 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-black/5">
        {product.isPromo && (
          <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1.5 rounded-sm">
            Promo
          </div>
        )}
        {product.isNew && !product.isPromo && (
          <div className="absolute top-3 left-3 z-10 bg-zinc-900 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1.5 rounded-sm">
            Nouveau
          </div>
        )}
        
        <img
          src={getProductImage(product)}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
        />

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="w-full bg-zinc-900/95 backdrop-blur-md text-white font-medium text-[13px] py-3.5 rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <ShoppingBag className="w-4 h-4" />
            {product.stock > 0 ? "Ajouter au panier" : "Rupture de stock"}
          </button>
        </div>
      </div>

      <div className="px-1 flex flex-col">
        {product.brand && (
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-1.5">{product.brand}</p>
        )}
        <div className="flex items-start justify-between gap-4 mb-1">
          <h3 className="font-medium text-zinc-900 text-sm leading-snug group-hover:text-zinc-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
          <div className="flex flex-col items-end shrink-0">
            <p className="text-zinc-900 font-semibold text-sm">
              {formatPrice(product.promoPrice || product.price)}
            </p>
            {product.isPromo && product.promoPrice && (
              <p className="text-red-500 line-through text-[11px] font-medium mt-0.5">
                {formatPrice(product.price)}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}



