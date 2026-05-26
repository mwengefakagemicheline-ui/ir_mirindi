import { X, ShoppingCart, Package, Star } from 'lucide-react';
import { Database } from '../lib/database.types';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductDetailProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductDetail({ product, onClose }: ProductDetailProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
    }, quantity);
    onClose();
  };

  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg text-gray-700 hover:text-gray-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="grid md:grid-cols-2 gap-8 p-8">
            <div className="relative">
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full rounded-lg shadow-md"
                />
              )}
              {hasDiscount && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                  -{discountPercent}%
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>

                <div className="flex items-center gap-2 mb-6">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <span className="text-gray-600">(4.8 / 5)</span>
                </div>

                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-bold text-blue-600">
                    {Number(product.price).toFixed(2)} €
                  </span>
                  {hasDiscount && (
                    <span className="text-xl text-gray-500 line-through">
                      {Number(product.compare_price).toFixed(2)} €
                    </span>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Package className="w-5 h-5" />
                    <span className="font-medium">
                      {product.stock > 0 ? (
                        <span className="text-green-600">
                          En stock ({product.stock} disponibles)
                        </span>
                      ) : (
                        <span className="text-red-600">Rupture de stock</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Référence</h3>
                  <p className="text-gray-600 font-mono">{product.sku}</p>
                </div>
              </div>

              {product.stock > 0 && (
                <div className="border-t pt-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="font-medium text-gray-700">Quantité:</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium text-lg"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Ajouter au panier
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
