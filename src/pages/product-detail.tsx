import { useParams, Link } from "wouter";
import { useGetProduct } from "@/lib/api-client";
import { useCart } from "@/lib/cart-context";
import { formatUnknownPrice } from "@/lib/utils";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Truck, ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getProductImage } from "@/lib/image-fallbacks";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = id || "";

  const { data: product, isLoading, error } = useGetProduct(productId);

  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const productImage = product ? getProductImage(product) : "";

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast({
        title: "Ajouté au panier",
        description: `${quantity}x ${product.name} a été ajouté à votre panier.`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-full max-w-md rounded-[2rem] overflow-hidden shadow-lg shadow-zinc-900/5 mb-8">
          <img
            src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80"
            alt="Produit"
            className="w-full h-64 object-cover"
          />
        </div>
        <h2 className="text-2xl font-medium mb-4">Produit introuvable</h2>
        <Link href="/catalog" className="text-zinc-500 hover:text-zinc-900 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Retour au catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <Link href="/catalog" className="inline-flex items-center text-xs font-medium text-zinc-500 hover:text-zinc-900 mb-10 transition-colors uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4 mr-2" /> Retour
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-zinc-50 rounded-2xl overflow-hidden relative">
            {product.isPromo && (
              <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-md">
                Promo
              </div>
            )}
            <img
              src={productImage}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-zinc-100 rounded-xl overflow-hidden cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                <img src={productImage} alt={`${product.name} vue ${i}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="mb-2 text-xs font-medium tracking-[0.2em] uppercase text-zinc-400">
            {product.brand || product.categoryName || "Accessoire"}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-medium text-zinc-900 mb-4 leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-8">
            <span className="text-2xl font-medium text-zinc-900">
              {formatUnknownPrice()}
            </span>
          </div>

          <div className="prose prose-sm text-zinc-600 mb-10 leading-relaxed">
            <p>{product.description || "Aucune description disponible pour ce produit. Il a été conçu avec soin pour répondre à vos exigences."}</p>
          </div>

          <div className="mb-10 space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-zinc-900 w-20">Quantité</span>
              <div className="flex items-center bg-zinc-50 rounded-lg border border-zinc-200">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-medium text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-3 text-zinc-500 hover:text-zinc-900 transition-colors"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-zinc-500 ml-4">
                {product.stock > 0 ? `${product.stock} en stock` : <span className="text-red-500">Rupture de stock</span>}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="w-full bg-zinc-900 text-white py-4 rounded-xl font-medium tracking-wide uppercase text-sm flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-5 h-5" />
              {product.stock > 0 ? "Ajouter au panier" : "Indisponible"}
            </button>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-zinc-100">
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-zinc-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm text-zinc-900">Livraison Rapide</h4>
                <p className="text-xs text-zinc-500 mt-1">Expédié sous 24/48h ouvrées</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-zinc-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm text-zinc-900">Garantie 2 ans</h4>
                <p className="text-xs text-zinc-500 mt-1">Sur tous nos produits</p>
              </div>
            </div>
          </div>

          {/* Details list */}
          <div className="mt-12 pt-8 border-t border-zinc-100">
            <h3 className="font-medium text-sm uppercase tracking-widest text-zinc-900 mb-6">Détails du produit</h3>
            <dl className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-zinc-50 pb-2">
                <dt className="text-zinc-500">SKU</dt>
                <dd className="font-medium text-zinc-900">{product.sku || `PRD-${product.id.slice(0, 4)}`}</dd>
              </div>
              <div className="flex justify-between border-b border-zinc-50 pb-2">
                <dt className="text-zinc-500">Marque</dt>
                <dd className="font-medium text-zinc-900">{product.brand || "-"}</dd>
              </div>
              <div className="flex justify-between border-b border-zinc-50 pb-2">
                <dt className="text-zinc-500">Catégorie</dt>
                <dd className="font-medium text-zinc-900">{product.categoryName}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}


