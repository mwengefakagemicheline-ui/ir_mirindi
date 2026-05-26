import { useEffect, useState } from 'react';
import { Search, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import ProductCard from './ProductCard';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

interface ProductCatalogProps {
  onProductClick: (product: Product) => void;
}

export default function ProductCatalog({ onProductClick }: ProductCatalogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (data) setCategories(data);
  };

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory);
    }

    const { data } = await query;
    if (data) setProducts(data);
    setLoading(false);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredProducts = filteredProducts.filter(p => p.is_featured);
  const newProducts = filteredProducts.filter(p => p.is_new && !p.is_featured);
  const regularProducts = filteredProducts.filter(p => !p.is_featured && !p.is_new);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-8 md:p-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Accessoires Premium
        </h1>
        <p className="text-xl text-blue-100 max-w-2xl">
          Découvrez notre sélection d'accessoires de qualité pour téléphones, ordinateurs et électroménager
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {featuredProducts.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Produits en vedette</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => onProductClick(product)}
                  />
                ))}
              </div>
            </section>
          )}

          {newProducts.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nouveautés</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {newProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => onProductClick(product)}
                  />
                ))}
              </div>
            </section>
          )}

          {regularProducts.length > 0 && (
            <section>
              {(featuredProducts.length > 0 || newProducts.length > 0) && (
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Tous les produits</h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {regularProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => onProductClick(product)}
                  />
                ))}
              </div>
            </section>
          )}

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Aucun produit trouvé</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
