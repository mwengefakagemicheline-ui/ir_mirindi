import { ShoppingCart, Sparkles } from 'lucide-react';
import { Database } from '../lib/database.types';
import { useCart } from '../contexts/CartContext';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
    });
  };

  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group border border-gray-100"
    >
      <div className="relative overflow-hidden bg-gray-100 aspect-square">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        )}
        {product.is_new && (
          <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Nouveau
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            -{discountPercent}%
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold">
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-blue-600">
            {Number(product.price).toFixed(2)} €
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-500 line-through">
              {Number(product.compare_price).toFixed(2)} €
            </span>
          )}
        </div>

        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-sm text-orange-600 mb-3">
            Plus que {product.stock} en stock
          </p>
        )}

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-4 h-4" />
          Ajouter au panier
        </button>
      </div>
    </div>
  );
}
