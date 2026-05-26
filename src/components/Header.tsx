import { ShoppingCart, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';
import AuthModal from './AuthModal';

interface HeaderProps {
  onCartClick: () => void;
  onLogoClick: () => void;
  onAdminClick: () => void;
}

export default function Header({ onCartClick, onLogoClick, onAdminClick }: HeaderProps) {
  const { user, signOut, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onLogoClick}
              className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
            >
              ShopAccessoires
            </button>

            <div className="flex items-center gap-4">
              {isAdmin && (
                <button
                  onClick={onAdminClick}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}

              <button
                onClick={onCartClick}
                className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 hidden sm:inline">
                    {user.email}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="hidden sm:inline">Déconnexion</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">Connexion</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
