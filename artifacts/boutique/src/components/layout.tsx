import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Search, Menu, User, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Layout({ children }: { children: ReactNode }) {
  const { totalItems } = useCart();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: "Accueil", path: "/" },
    { name: "Catalogue", path: "/catalog" },
    { name: "Agricole", path: "/agricole", green: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-zinc-200">
      <header
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300 border-b",
          scrolled 
            ? "bg-white/90 backdrop-blur-md border-zinc-200 py-3 shadow-sm" 
            : "bg-white border-transparent py-4"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 -ml-2 text-zinc-600 hover:text-zinc-900"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <Link 
            href="/" 
            className="font-display text-lg md:text-xl font-bold tracking-[0.2em] text-zinc-900 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0"
          >
            A C C E S S O I R E S
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={cn(
                  "text-[12px] tracking-[0.15em] uppercase transition-colors font-medium",
                  link.green
                    ? location === link.path
                      ? "text-green-600 font-semibold"
                      : "text-green-500 hover:text-green-700"
                    : location === link.path
                      ? "text-zinc-900 font-semibold"
                      : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                {link.green && <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 mb-0.5 align-middle" />}
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-5 md:gap-7">
            <Link href="/catalog" className="text-zinc-600 hover:text-zinc-900 transition-colors hidden sm:block">
              <Search className="w-4 h-4" />
            </Link>
            <Link href="/admin" className="text-zinc-600 hover:text-zinc-900 transition-colors">
              <User className="w-4 h-4" />
            </Link>
            <Link href="/cart" className="relative text-zinc-600 hover:text-zinc-900 transition-colors group flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-2 -right-2 bg-zinc-900 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-white z-50 shadow-2xl md:hidden flex flex-col"
            >
              <div className="p-6 flex justify-between items-center border-b border-zinc-100">
                <span className="font-display font-bold tracking-[0.2em] text-sm text-zinc-900">MENU</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-zinc-400 hover:text-zinc-900 bg-zinc-50 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-col py-6 px-6 gap-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={cn(
                      "text-sm tracking-[0.1em] uppercase transition-colors flex items-center gap-2",
                      link.green
                        ? location === link.path ? "text-green-600 font-semibold" : "text-green-500 font-medium"
                        : location === link.path ? "text-zinc-900 font-semibold" : "text-zinc-500 font-medium"
                    )}
                  >
                    {link.green && <span className="w-2 h-2 rounded-full bg-green-500" />}
                    {link.name}
                  </Link>
                ))}
              </div>
              <div className="mt-auto p-6 bg-zinc-50">
                <Link href="/admin" className="flex items-center gap-3 text-sm tracking-widest uppercase text-zinc-600 font-medium">
                  <User className="w-4 h-4" /> Espace Admin
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="bg-zinc-950 border-t border-zinc-900 py-20 text-zinc-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5 text-center md:text-left">
            <h3 className="font-display text-xl font-bold tracking-[0.2em] mb-6 text-white">A C C E S S O I R E S</h3>
            <p className="text-zinc-500 max-w-sm mx-auto md:mx-0 leading-relaxed">
              Des accessoires premium pour votre quotidien technologique et votre art de vivre. Qualité, design et performance.
            </p>
          </div>
          <div className="md:col-span-3">
            <h4 className="font-semibold mb-6 text-white tracking-[0.15em] text-xs uppercase">Boutique</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/catalog?category=telephones" className="hover:text-white transition-colors">Téléphones</Link></li>
              <li><Link href="/catalog?category=ordinateurs" className="hover:text-white transition-colors">Ordinateurs</Link></li>
              <li><Link href="/catalog?category=cafetieres" className="hover:text-white transition-colors">Cafetières</Link></li>
              <li><Link href="/catalog?category=audio" className="hover:text-white transition-colors">Audio</Link></li>
            </ul>
          </div>
          <div className="md:col-span-4">
            <h4 className="font-semibold mb-6 text-white tracking-[0.15em] text-xs uppercase">Assistance</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Contactez-nous</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Livraison & Retours</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Garantie & SAV</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <p>&copy; {new Date().getFullYear()} Boutique Accessoires. Tous droits réservés.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
              <a href="#" className="hover:text-white transition-colors">CGV</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

