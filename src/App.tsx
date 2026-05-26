import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import ProductCatalog from './components/ProductCatalog';
import ProductDetail from './components/ProductDetail';
import CartModal from './components/CartModal';
import Checkout from './components/Checkout';
import AdminDashboard from './components/AdminDashboard';
import { Database } from './lib/database.types';
import { CheckCircle } from 'lucide-react';

type Product = Database['public']['Tables']['products']['Row'];
type Page = 'catalog' | 'checkout' | 'admin' | 'success';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('catalog');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCart, setShowCart] = useState(false);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCheckout = () => {
    setCurrentPage('checkout');
  };

  const handleOrderSuccess = () => {
    setCurrentPage('success');
    setTimeout(() => {
      setCurrentPage('catalog');
    }, 3000);
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          <Header
            onCartClick={() => setShowCart(true)}
            onLogoClick={() => setCurrentPage('catalog')}
            onAdminClick={() => setCurrentPage('admin')}
          />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {currentPage === 'catalog' && (
              <ProductCatalog onProductClick={handleProductClick} />
            )}

            {currentPage === 'checkout' && (
              <Checkout
                onBack={() => setCurrentPage('catalog')}
                onSuccess={handleOrderSuccess}
              />
            )}

            {currentPage === 'admin' && <AdminDashboard />}

            {currentPage === 'success' && (
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Commande confirmée
                  </h2>
                  <p className="text-gray-600">
                    Merci pour votre commande. Vous recevrez un email de confirmation dans quelques instants.
                  </p>
                </div>
              </div>
            )}
          </main>

          <ProductDetail
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />

          <CartModal
            isOpen={showCart}
            onClose={() => setShowCart(false)}
            onCheckout={handleCheckout}
          />

          <footer className="bg-white border-t mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center text-gray-600">
                <p className="font-medium">ShopAccessoires - Votre boutique d'accessoires premium</p>
                <p className="text-sm mt-2">Livraison rapide - Paiement sécurisé - SAV réactif</p>
              </div>
            </div>
          </footer>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
