import { useParams, Link } from "wouter";
import { useGetOrder } from "@/lib/api-client";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { formatUnknownPrice } from "@/lib/utils";

export function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const orderId = id || "";

  const { data: order, isLoading } = useGetOrder(orderId);

  const cityLine = order ? [order.postalCode, order.city].filter(Boolean).join(" ") : "";

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-medium mb-4">Commande introuvable</h1>
        <Link href="/" className="text-zinc-500 hover:text-zinc-900 underline">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 text-green-600 rounded-full mb-8">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      
      <h1 className="text-4xl font-display font-medium text-zinc-900 mb-4">Merci pour votre commande !</h1>
      <p className="text-zinc-500 mb-2">Un email de confirmation a été envoyé à <span className="font-medium text-zinc-900">{order.customerEmail}</span>.</p>
      <p className="text-sm text-zinc-400 mb-12">Commande n° #{order.id.slice(0, 8)}</p>

      <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-8 max-w-lg mx-auto text-left mb-12">
        <h2 className="font-medium text-sm tracking-widest uppercase text-zinc-900 mb-6 border-b border-zinc-200 pb-4">Résumé</h2>
        
        <div className="space-y-4 mb-6">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-zinc-600">{item.quantity}x {item.productName}</span>
              <span className="font-medium text-zinc-900">{formatUnknownPrice()}</span>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center border-t border-zinc-200 pt-4">
          <span className="font-medium text-zinc-900">Total payé</span>
          <span className="text-lg font-medium text-zinc-900">{formatUnknownPrice()}</span>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-200">
          <h3 className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Expédié à :</h3>
          <p className="text-sm font-medium text-zinc-900">{order.customerName}</p>
          <p className="text-sm text-zinc-600">{order.shippingAddress}</p>
          <p className="text-sm text-zinc-600">{cityLine}</p>
        </div>
      </div>

      <Link 
        href="/catalog" 
        className="inline-flex items-center text-sm font-medium text-zinc-900 hover:text-zinc-600 transition-colors"
      >
        Continuer vos achats <ArrowRight className="w-4 h-4 ml-2" />
      </Link>
    </div>
  );
}




