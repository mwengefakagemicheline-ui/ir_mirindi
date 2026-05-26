import { useState } from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface CheckoutProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function Checkout({ onBack, onSuccess }: CheckoutProps) {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          shipping_address: formData.address,
          notes: formData.notes,
          total: total,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_image: item.image_url,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      for (const item of items) {
        await supabase.rpc('decrement_stock', {
          product_id: item.id,
          quantity: item.quantity,
        });
      }

      clearCart();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Retour
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Finaliser la commande</h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse de livraison *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="Rue, ville, code postal"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium text-lg"
              >
                <CreditCard className="w-5 h-5" />
                {loading ? 'Traitement...' : 'Confirmer la commande'}
              </button>
            </form>
          </div>

          <div>
            <div className="bg-gray-50 rounded-lg p-6 sticky top-8">
              <h3 className="font-bold text-gray-900 mb-4">Récapitulatif</h3>
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium">
                      {(item.price * item.quantity).toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">{total.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
