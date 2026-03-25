import { Link } from "wouter";
import { useListProducts } from "@/lib/api-client";
import { ProductCard } from "@/components/product-card";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function Home() {
  // Fetch a few featured products
  const { data: productsData, isLoading: loadingProds } = useListProducts({ limit: 4, page: 1 });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="pb-0">
      {/* Hero Section */}
      <section className="relative h-[100vh] min-h-[600px] flex flex-col justify-between overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero.png`}
            alt="Hero background"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center text-center px-4 max-w-4xl mx-auto mt-20 w-full">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="w-full flex flex-col items-center"
          >
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-display font-semibold text-white mb-6 leading-tight tracking-tight drop-shadow-md"
            >
              L'essentiel pour votre quotidien
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-sm md:text-base text-zinc-300 mb-10 max-w-2xl font-light tracking-wide"
            >
              Des accessoires premium selectionnes pour leur performance et leur design.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/catalog"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white text-zinc-900 text-xs tracking-widest uppercase font-semibold rounded-full hover:bg-zinc-100 transition-colors duration-300"
              >
                Decouvrir le catalogue
              </Link>
              <Link
                href="/catalog?sort=newest"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-transparent border border-white text-white text-xs tracking-widest uppercase font-semibold rounded-full hover:bg-white/10 transition-colors duration-300"
              >
                Voir les nouveaut�s
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="relative z-10 w-full border-t border-white/20 bg-black/20 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-4 py-5">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs tracking-widest uppercase text-white/80 font-medium">
              <span>20+ Produits</span>
              <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/40"></span>
              <span>5 Cat�gories</span>
              <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/40"></span>
              <span>Livraison express</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex items-center gap-4 mb-16">
          <h2 className="text-3xl font-display font-medium text-zinc-900 uppercase tracking-wider">Nos univers</h2>
          <div className="flex-1 h-px bg-zinc-200"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { id: 1, name: 'T�l�phones', slug: 'telephones', image: 'cat-phone.png', count: 12 },
            { id: 2, name: 'Ordinateurs', slug: 'ordinateurs', image: 'cat-computer.png', count: 8 },
            { id: 3, name: 'Cafeti�res', slug: 'cafetieres', image: 'cat-coffee.png', count: 5 },
            { id: 4, name: 'Audio', slug: 'audio', count: 14, fallbackColors: 'from-zinc-800 to-zinc-950' },
            { id: 5, name: 'Stockage', slug: 'stockage', count: 6, fallbackColors: 'from-slate-700 to-slate-900' }
          ].map((cat) => (
            <Link key={cat.id} href={`/catalog?category=${cat.slug}`} className="group block relative overflow-hidden rounded-xl aspect-[3/4] bg-zinc-100 shadow-sm hover:shadow-xl transition-all duration-500">
              {cat.image ? (
                <img
                  src={`${import.meta.env.BASE_URL}images/${cat.image}`}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${cat.fallbackColors} transition-transform duration-700 group-hover:scale-110`} />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-colors duration-500"></div>

              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-white text-xl font-medium tracking-wide drop-shadow-md mb-1">{cat.name}</h3>
                <p className="text-white/70 text-xs tracking-wider">{cat.count} produits</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="bg-zinc-900 py-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-16 text-white text-sm tracking-wider uppercase font-medium">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-zinc-400" />
              <span>Livraison gratuite</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-zinc-400" />
              <span>Retours sous 30 jours</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-zinc-400" />
              <span>Garantie 2 ans</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 text-[200px] font-display font-bold text-zinc-50 select-none z-0 leading-none">
          01
        </div>

        <div className="relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-medium text-zinc-900 mb-4">S�lection du moment</h2>
            <div className="w-16 h-px bg-zinc-300 mx-auto"></div>
          </div>

          {loadingProds ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="animate-pulse">
                  <div className="bg-zinc-200 aspect-square rounded-xl mb-4"></div>
                  <div className="bg-zinc-200 h-4 w-2/3 rounded mb-2"></div>
                  <div className="bg-zinc-200 h-4 w-1/3 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {productsData?.products?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-20">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center px-10 py-4 bg-zinc-900 text-white text-xs tracking-widest uppercase font-medium rounded-full hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-900/20"
            >
              Voir toute la collection
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

