import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart } from "@/lib/cart-context";
import { formatUnknownPrice, cn } from "@/lib/utils";
import { useCreateOrder } from "@/lib/api-client";
import { useLocation, Link } from "wouter";
import { ChevronLeft, Lock } from "lucide-react";
import { useEffect } from "react";
import { getProductImage } from "@/lib/image-fallbacks";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Nom requis"),
  customerEmail: z.string().email("Email invalide"),
  shippingAddress: z.string().min(5, "Adresse requise"),
  city: z.string().min(2, "Ville requise"),
  postalCode: z.string().min(4, "Code postal requis"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export function Checkout() {
  const { items, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { mutateAsync: createOrder, isPending } = useCreateOrder();

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  });

  useEffect(() => {
    if (items.length === 0) {
      setLocation("/cart");
    }
  }, [items, setLocation]);

  const onSubmit = async (data: CheckoutForm) => {
    try {
      const orderItems = items.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));
      
      const order = await createOrder({
        data: {
          ...data,
          items: orderItems
        }
      });
      
      clearCart();
      setLocation(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error("Failed to create order", error);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      <Link href="/cart" className="inline-flex items-center text-xs font-medium text-zinc-500 hover:text-zinc-900 mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Retour au panier
      </Link>

      <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
        {/* Form */}
        <div className="flex-1">
          <h1 className="text-2xl font-display font-medium text-zinc-900 mb-8">Informations de livraison</h1>
          
          <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-sm font-medium tracking-widest uppercase text-zinc-900 border-b border-zinc-100 pb-2 mb-4">Contact</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-600 mb-1.5 ml-1">Nom complet</label>
                  <input 
                    {...register("customerName")}
                    className={cn(
                      "w-full bg-zinc-50 border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-shadow",
                      errors.customerName ? "border-red-300 bg-red-50 focus:ring-red-500/20" : "border-zinc-200"
                    )}
                    placeholder="Jean Dupont"
                  />
                  {errors.customerName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.customerName.message}</p>}
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 mb-1.5 ml-1">Email</label>
                  <input 
                    {...register("customerEmail")}
                    type="email"
                    className={cn(
                      "w-full bg-zinc-50 border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-shadow",
                      errors.customerEmail ? "border-red-300 bg-red-50 focus:ring-red-500/20" : "border-zinc-200"
                    )}
                    placeholder="jean@exemple.com"
                  />
                  {errors.customerEmail && <p className="text-red-500 text-xs mt-1 ml-1">{errors.customerEmail.message}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <h2 className="text-sm font-medium tracking-widest uppercase text-zinc-900 border-b border-zinc-100 pb-2 mb-4">Adresse</h2>
              
              <div>
                <label className="block text-xs text-zinc-600 mb-1.5 ml-1">Adresse postale</label>
                <input 
                  {...register("shippingAddress")}
                  className={cn(
                    "w-full bg-zinc-50 border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-shadow",
                    errors.shippingAddress ? "border-red-300 bg-red-50 focus:ring-red-500/20" : "border-zinc-200"
                  )}
                  placeholder="123 Avenue des Champs-Élysées"
                />
                {errors.shippingAddress && <p className="text-red-500 text-xs mt-1 ml-1">{errors.shippingAddress.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-600 mb-1.5 ml-1">Code postal</label>
                  <input 
                    {...register("postalCode")}
                    className={cn(
                      "w-full bg-zinc-50 border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-shadow",
                      errors.postalCode ? "border-red-300 bg-red-50 focus:ring-red-500/20" : "border-zinc-200"
                    )}
                    placeholder="75008"
                  />
                  {errors.postalCode && <p className="text-red-500 text-xs mt-1 ml-1">{errors.postalCode.message}</p>}
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 mb-1.5 ml-1">Ville</label>
                  <input 
                    {...register("city")}
                    className={cn(
                      "w-full bg-zinc-50 border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-shadow",
                      errors.city ? "border-red-300 bg-red-50 focus:ring-red-500/20" : "border-zinc-200"
                    )}
                    placeholder="Paris"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1 ml-1">{errors.city.message}</p>}
                </div>
              </div>
            </div>
            
            {/* Fake Payment block to complete design */}
            <div className="space-y-4 pt-6">
              <h2 className="text-sm font-medium tracking-widest uppercase text-zinc-900 border-b border-zinc-100 pb-2 mb-4">Paiement</h2>
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 flex items-center justify-center text-center">
                <p className="text-sm text-zinc-500 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Mode démo - Aucun paiement réel ne sera effectué.
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:w-[400px]">
          <div className="bg-zinc-50 rounded-2xl p-6 md:p-8 border border-zinc-100 sticky top-28">
            <h2 className="font-display font-medium text-lg mb-6">Récapitulatif</h2>
            
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 bg-white rounded-md overflow-hidden flex-shrink-0 border border-zinc-100 relative">
                    <span className="absolute -top-1.5 -right-1.5 bg-zinc-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center z-10">
                      {item.quantity}
                    </span>
                    <img src={getProductImage(item)} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="text-sm font-medium text-zinc-900 line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">{formatUnknownPrice()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-200 pt-6 space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-zinc-600">
                <span>Sous-total</span>
                <span>{formatUnknownPrice()}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Livraison</span>
                <span>Gratuite</span>
              </div>
            </div>

            <div className="border-t border-zinc-200 pt-6 mb-8 flex justify-between items-center">
              <span className="font-medium text-zinc-900">Total à payer</span>
              <span className="text-2xl font-display font-medium text-zinc-900">{formatUnknownPrice()}</span>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={isPending}
              className="w-full bg-zinc-900 text-white py-4 rounded-xl font-medium tracking-wide uppercase text-sm flex items-center justify-center hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Confirmer la commande"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}




