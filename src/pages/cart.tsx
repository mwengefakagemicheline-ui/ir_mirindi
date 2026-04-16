import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { Link } from "wouter";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { getProductImage } from "@/lib/image-fallbacks";

export function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center flex flex-col items-center">
        <div className="w-44 h-44 rounded-[2rem] overflow-hidden mb-8 shadow-lg shadow-zinc-900/5">
          <img
            src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80"
            alt="Accessoires"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-display font-medium text-zinc-900 mb-4">Votre panier est vide</h1>
        <p className="text-zinc-500 mb-8 max-w-md">
          On dirait que vous n'avez pas encore trouvé votre bonheur. Découvrez notre sélection d'accessoires.
        </p>
        <Link 
          href="/catalog"
          className="bg-zinc-900 text-white px-8 py-3.5 rounded-full text-sm font-medium tracking-wide hover:bg-zinc-800 transition-colors"
        >
          Découvrir nos produits
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <h1 className="text-3xl font-display font-medium text-zinc-900 mb-12">Mon Panier</h1>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        <div className="flex-1">
          <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-zinc-200 text-xs font-medium tracking-widest uppercase text-zinc-500">
            <div className="col-span-6">Produit</div>
            <div className="col-span-3 text-center">Quantité</div>
            <div className="col-span-3 text-right">Total</div>
          </div>

          <div className="divide-y border-b border-zinc-100">
            {items.map((item) => (
              <motion.div 
                layout
                key={item.id} 
                className="py-6 flex flex-col md:grid md:grid-cols-12 gap-6 items-center"
              >
                {/* Product Info */}
                <div className="col-span-6 flex items-center gap-6 w-full">
                  <div className="w-20 h-24 md:w-24 md:h-32 bg-zinc-50 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={getProductImage(item)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <Link href={`/product/${item.id}`} className="font-medium text-zinc-900 hover:underline block mb-1 text-sm md:text-base">
                      {item.name}
                    </Link>
                    <p className="text-zinc-500 text-sm mb-3">{formatPrice(item.promoPrice || item.price)}</p>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs text-zinc-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Supprimer
                    </button>
                  </div>
                </div>

                {/* Quantity Mobile & Desktop */}
                <div className="col-span-3 w-full md:w-auto flex justify-between md:justify-center items-center">
                  <span className="md:hidden text-sm text-zinc-500">Quantité</span>
                  <div className="flex items-center bg-zinc-50 rounded border border-zinc-200 h-9">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 text-zinc-500 hover:text-zinc-900"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, Math.min(item.stock, item.quantity + 1))}
                      className="px-3 text-zinc-500 hover:text-zinc-900"
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Total Mobile & Desktop */}
                <div className="col-span-3 w-full md:w-auto flex justify-between md:justify-end items-center">
                  <span className="md:hidden text-sm text-zinc-500">Sous-total</span>
                  <span className="font-medium text-zinc-900">
                    {formatPrice((item.promoPrice || item.price) * item.quantity)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:w-96 flex-shrink-0">
          <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-100">
            <h2 className="text-lg font-medium text-zinc-900 mb-6">Résumé de la commande</h2>
            
            <div className="space-y-4 text-sm mb-6 border-b border-zinc-200 pb-6">
              <div className="flex justify-between">
                <span className="text-zinc-500">Sous-total</span>
                <span className="font-medium text-zinc-900">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Livraison</span>
                <span className="text-zinc-500 text-xs">Calculée à l'étape suivante</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-8">
              <span className="font-medium text-zinc-900">Total</span>
              <span className="text-2xl font-display font-medium text-zinc-900">{formatPrice(totalPrice)}</span>
            </div>

            <Link 
              href="/checkout"
              className="w-full bg-zinc-900 text-white py-4 rounded-xl font-medium tracking-wide uppercase text-sm flex items-center justify-center hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-900/10"
            >
              Procéder au paiement <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            
            <p className="text-center text-xs text-zinc-400 mt-6 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Paiement sécurisé
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



