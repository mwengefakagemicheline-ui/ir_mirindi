import { Link } from "wouter";
import { useListProducts, useListCategories } from "@/lib/api-client";
import { ProductCard } from "@/components/product-card";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { getCategoryFallbackImage } from "@/lib/image-fallbacks";

export function Home() {
  const { data: categoriesData, isLoading: loadingCats } = useListCategories();
  const { data: productsData, isLoading: loadingProds } = useListProducts({
    limit: 4,
    page: 1,
    featured: true,
  });

  const featuredCategories = (categoriesData || []).filter((category) => category.showOnHome).slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="pb-0">
      <section className="relative min-h-[720px] h-[100vh] overflow-hidden bg-[#1a1714]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,248,236,0.18),transparent_45%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,241,225,0.14),transparent_40%)]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/55"></div>
          <img
            src={`${import.meta.env.BASE_URL}images/hero.png`}
            alt="Hero background"
            className="absolute inset-0 w-full h-full object-cover opacity-55"
          />
        </div>

        <div className="relative z-10 h-full">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 items-center gap-10"
          >
            <div className="max-w-3xl">
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-[#f6ede1] bg-white/15 border border-white/20 px-4 py-2 rounded-full"
              >
                Boutique premium
                <span className="w-1.5 h-1.5 rounded-full bg-[#e9d9c3]"></span>
                Sélection 2026
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-semibold text-[#fff7ef] leading-[1.05]"
              >
                Des accessoires qui élèvent
                <span className="block text-[#d9c7b1]">votre quotidien.</span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="mt-6 text-sm md:text-base text-[#f3e6d8]/95 max-w-2xl leading-relaxed"
              >
                Design minimal, matériaux solides, compatibilité parfaite. Tout ce qu'il faut pour un usage fluide, durable et élégant.
              </motion.p>

              <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link
                  href="/catalog"
                  className="inline-flex items-center justify-center px-8 py-4 bg-[#fff1df] text-[#3a2f25] text-xs tracking-widest uppercase font-semibold rounded-full hover:bg-[#fff7ef] transition-colors duration-300"
                >
                  Découvrir le catalogue
                </Link>
                <Link
                  href="/catalog?sort=newest"
                  className="inline-flex items-center justify-center px-8 py-4 bg-transparent border border-[#ead6be]/70 text-[#fff1df] text-xs tracking-widest uppercase font-semibold rounded-full hover:bg-white/15 transition-colors duration-300"
                >
                  Voir les nouveautés
                </Link>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="mt-10 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-widest text-[#ead6be]"
              >
                <span className="px-3 py-2 rounded-full bg-white/15 border border-white/15">Livraison 48h</span>
                <span className="px-3 py-2 rounded-full bg-white/15 border border-white/15">Paiement sécurisé</span>
                <span className="px-3 py-2 rounded-full bg-white/15 border border-white/15">Retours 30 jours</span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="absolute bottom-0 left-0 right-0 z-10 w-full border-t border-white/20 bg-black/20 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-4 py-5">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs tracking-widest uppercase text-[#f3e6d8] font-medium">
              <span>20+ Produits</span>
              <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/50"></span>
              <span>5 Catégories</span>
              <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/50"></span>
              <span>Livraison express</span>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex items-center gap-4 mb-16">
          <h2 className="text-3xl font-display font-medium text-zinc-900 uppercase tracking-wider">Nos univers</h2>
          <div className="flex-1 h-px bg-zinc-200"></div>
        </div>

        {loadingCats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="animate-pulse bg-zinc-200 rounded-xl aspect-[3/4]"></div>
            ))}
          </div>
        ) : featuredCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {featuredCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/catalog?category=${cat.slug}`}
                className="group block relative overflow-hidden rounded-xl aspect-[3/4] bg-zinc-100 shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <img
                  src={cat.imageUrl || getCategoryFallbackImage(cat.slug, cat.name)}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-colors duration-500"></div>

                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-white text-xl font-medium tracking-wide drop-shadow-md mb-1">{cat.name}</h3>
                  <p className="text-white/70 text-xs tracking-wider">Explorer</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center text-sm text-zinc-500">
            Aucune catégorie n'est activée pour l'accueil. Activez-les depuis l'administration.
          </div>
        )}
      </section>

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

      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 text-[200px] font-display font-bold text-zinc-50 select-none z-0 leading-none">
          01
        </div>

        <div className="relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-medium text-zinc-900 mb-4">Sélection du moment</h2>
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
          ) : productsData?.products?.length ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {productsData.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center text-sm text-zinc-500">
              Aucun produit n'est activé pour la sélection du moment. Activez-les depuis l'administration.
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
