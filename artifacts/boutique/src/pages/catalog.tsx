import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/product-card";
import { Search, Filter, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Catalog() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const [category, setCategory] = useState<string>(searchParams.get("category") || "");
  const [search, setSearch] = useState<string>(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Update URL state without page reload using history.pushState is tricky with wouter without an adapter.
  // We'll rely on React Query for refetching based on state changes.
  
  const { data: categories } = useListCategories();
  
  const { data: productsData, isLoading } = useListProducts({
    category: category || undefined,
    search: debouncedSearch || undefined,
    limit: 20
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-display font-medium text-zinc-900 mb-4">
          {category ? categories?.find(c => c.slug === category)?.name || 'Catalogue' : 'Tout le Catalogue'}
        </h1>
        <p className="text-zinc-500 max-w-2xl">
          Parcourez notre sélection rigoureuse d'accessoires conçus pour allier esthétique et performance.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <div className="relative flex-1 mr-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-50 border-none rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-zinc-900/10"
            />
          </div>
          <button 
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 bg-zinc-100 px-4 py-3 rounded-lg text-sm font-medium"
          >
            <Filter className="w-4 h-4" />
            Filtres
          </button>
        </div>

        {/* Sidebar Filters */}
        <div className={cn(
          "lg:w-64 flex-shrink-0",
          mobileFiltersOpen ? "fixed inset-0 z-50 bg-white p-6 overflow-y-auto" : "hidden lg:block"
        )}>
          {mobileFiltersOpen && (
            <div className="flex justify-between items-center mb-8 lg:hidden">
              <h2 className="font-display text-xl font-medium">Filtres</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="sticky top-24 space-y-10">
            {/* Desktop Search */}
            <div className="hidden lg:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-50 border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900/10 transition-all"
              />
            </div>

            <div>
              <h3 className="text-xs font-medium tracking-widest uppercase text-zinc-900 mb-5">Catégories</h3>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => { setCategory(""); setMobileFiltersOpen(false); }}
                    className={cn(
                      "text-[13px] transition-colors w-full text-left",
                      category === "" ? "text-zinc-900 font-medium" : "text-zinc-500 hover:text-zinc-900"
                    )}
                  >
                    Toutes les catégories
                  </button>
                </li>
                {categories?.map((c) => (
                  <li key={c.id}>
                    <button 
                      onClick={() => { setCategory(c.slug); setMobileFiltersOpen(false); }}
                      className={cn(
                        "text-[13px] transition-colors w-full text-left flex items-center justify-between",
                        category === c.slug ? "text-zinc-900 font-medium" : "text-zinc-500 hover:text-zinc-900"
                      )}
                    >
                      {c.name}
                      {c.productCount !== undefined && (
                        <span className="text-[10px] bg-zinc-100 px-2 py-0.5 rounded-full text-zinc-400">{c.productCount}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Simulated Price Filter */}
            <div>
              <h3 className="text-xs font-medium tracking-widest uppercase text-zinc-900 mb-5">Prix</h3>
              <div className="space-y-4">
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <div className="w-4 h-4 rounded border border-zinc-300 flex items-center justify-center group-hover:border-zinc-900 transition-colors"></div>
                   <span className="text-[13px] text-zinc-600 group-hover:text-zinc-900 transition-colors">Moins de 50â‚¬</span>
                 </label>
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <div className="w-4 h-4 rounded border border-zinc-300 flex items-center justify-center group-hover:border-zinc-900 transition-colors"></div>
                   <span className="text-[13px] text-zinc-600 group-hover:text-zinc-900 transition-colors">50â‚¬ - 150â‚¬</span>
                 </label>
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <div className="w-4 h-4 rounded border border-zinc-300 flex items-center justify-center group-hover:border-zinc-900 transition-colors"></div>
                   <span className="text-[13px] text-zinc-600 group-hover:text-zinc-900 transition-colors">Plus de 150â‚¬</span>
                 </label>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100">
            <span className="text-sm text-zinc-500">
              {isLoading ? "Chargement..." : `${productsData?.total || 0} produits`}
            </span>
            
            <div className="flex items-center gap-2 cursor-pointer group">
              <span className="text-[13px] text-zinc-600 group-hover:text-zinc-900">Trier par : Nouveautés</span>
              <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="animate-pulse">
                  <div className="bg-zinc-100 aspect-[4/5] rounded-xl mb-4"></div>
                  <div className="bg-zinc-100 h-4 w-2/3 rounded mb-2"></div>
                  <div className="bg-zinc-100 h-4 w-1/3 rounded"></div>
                </div>
              ))}
            </div>
          ) : productsData?.products.length === 0 ? (
            <div className="text-center py-24 px-4 bg-zinc-50 rounded-2xl">
              <Search className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-zinc-900 mb-2">Aucun produit trouvé</h3>
              <p className="text-zinc-500 mb-6">Nous n'avons trouvé aucun produit correspondant à votre recherche.</p>
              <button 
                onClick={() => { setSearch(""); setCategory(""); }}
                className="text-sm font-medium text-zinc-900 underline underline-offset-4"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {productsData?.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

