import { useMemo, useState } from "react";
import {
  useListProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useListCategories,
  useListOrders,
  useUpdateCategoryVisibility,
  useToggleProductFeatured,
} from "@/lib/api-client";
import { formatPrice, cn } from "@/lib/utils";
import { Edit2, Trash2, Plus, X, Image as ImageIcon, Package, Tags, Boxes, ShoppingCart } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";

const productSchema = z.object({
  name: z.string().min(2, "Requis"),
  price: z.coerce.number().min(0.01, "Requis"),
  categoryId: z.string().min(1, "Requis"),
  stock: z.coerce.number().min(0, "Requis"),
  description: z.string().optional(),
  imageUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  brand: z.string().optional(),
  isFeatured: z.boolean().default(false),
});

type ProductForm = z.infer<typeof productSchema>;

type DashboardProduct = {
  id: string;
  name: string;
  price: number;
  categoryId?: string | null;
  categoryName?: string | null;
  stock: number;
  brand?: string | null;
  sku: string;
  imageUrl?: string | null;
  description?: string | null;
  isFeatured: boolean;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: productsData, isLoading } = useListProducts({ limit: 100 });
  const { data: categories, isLoading: loadingCategories } = useListCategories();
  const { data: orders, isLoading: loadingOrders } = useListOrders(8);

  const createProd = useCreateProduct();
  const updateProd = useUpdateProduct();
  const deleteProd = useDeleteProduct();
  const updateCategoryVisibility = useUpdateCategoryVisibility();
  const toggleProductFeatured = useToggleProductFeatured();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null);
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      stock: 10,
      isFeatured: false,
    },
  });

  const stats = useMemo(() => {
    const products = productsData?.products ?? [];
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const lowStock = products.filter((product) => product.stock > 0 && product.stock <= 5).length;
    const featuredProducts = products.filter((product) => product.isFeatured).length;
    const homeCategories = (categories ?? []).filter((category) => category.showOnHome).length;

    return {
      products: products.length,
      categories: categories?.length ?? 0,
      totalStock,
      orders: orders?.length ?? 0,
      lowStock,
      featuredProducts,
      homeCategories,
    };
  }, [categories, orders, productsData]);

  const openCreate = () => {
    setEditingId(null);
    reset({
      name: "",
      price: 0,
      categoryId: "",
      stock: 10,
      description: "",
      imageUrl: "",
      brand: "",
      isFeatured: false,
    });
    setIsModalOpen(true);
  };

  const openEdit = (product: DashboardProduct) => {
    setEditingId(product.id);
    reset({
      name: product.name,
      price: product.price,
      categoryId: product.categoryId || "",
      stock: product.stock,
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      brand: product.brand || "",
      isFeatured: product.isFeatured,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: ProductForm) => {
    try {
      const payload = {
        ...data,
        imageUrl: data.imageUrl || undefined,
      };

      if (editingId) {
        await updateProd.mutateAsync({ id: editingId, data: payload });
        toast({ title: "Produit mis à jour" });
      } else {
        await createProd.mutateAsync({ data: payload });
        toast({ title: "Produit créé" });
      }
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsModalOpen(false);
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        await deleteProd.mutateAsync({ id });
        queryClient.invalidateQueries({ queryKey: ["products"] });
        toast({ title: "Produit supprimé" });
      } catch {
        toast({ title: "Erreur", variant: "destructive" });
      }
    }
  };

  const handleCategoryToggle = async (categoryId: string, showOnHome: boolean) => {
    try {
      setPendingCategoryId(categoryId);
      await updateCategoryVisibility.mutateAsync({ id: categoryId, showOnHome });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: showOnHome ? "Catégorie affichée sur l'accueil" : "Catégorie retirée de l'accueil" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de mettre à jour la catégorie.", variant: "destructive" });
    } finally {
      setPendingCategoryId(null);
    }
  };

  const handleProductFeaturedToggle = async (productId: string, isFeatured: boolean) => {
    try {
      setPendingProductId(productId);
      await toggleProductFeatured.mutateAsync({ id: productId, isFeatured });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: isFeatured ? "Produit ajouté à la sélection" : "Produit retiré de la sélection" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de mettre à jour ce produit.", variant: "destructive" });
    } finally {
      setPendingProductId(null);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Déconnexion réussie" });
    setLocation("/admin/login");
  };

  const statCards = [
    { label: "Produits", value: stats.products, icon: Package },
    { label: "Catégories", value: stats.categories, icon: Tags },
    { label: "Stock total", value: stats.totalStock, icon: Boxes },
    { label: "Commandes récentes", value: stats.orders, icon: ShoppingCart },
  ];

  const featuredValue = watch("isFeatured");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-display font-medium text-zinc-900">Dashboard admin</h1>
          <p className="text-zinc-500 mt-1">Gérez les produits, surveillez le stock et contrôlez l'accueil depuis ici.</p>
          {user?.email && <p className="text-xs uppercase tracking-[0.18em] text-zinc-400 mt-3">Connecté en tant que {user.email}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSignOut}
            className="bg-white text-zinc-700 px-5 py-2.5 rounded-lg text-sm font-medium border border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm"
          >
            Déconnexion
          </button>
          <button
            onClick={openCreate}
            className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Nouveau produit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">{card.label}</span>
                <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-display font-medium text-zinc-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-display font-medium text-zinc-900">Accueil: catégories</h2>
              <p className="text-sm text-zinc-500 mt-1">Cochez les catégories à afficher dans “Nos univers”.</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Actives</p>
              <p className="text-sm font-medium text-zinc-900">{stats.homeCategories}</p>
            </div>
          </div>
          <div className="divide-y divide-zinc-100">
            {loadingCategories ? (
              <p className="px-6 py-8 text-sm text-zinc-500">Chargement...</p>
            ) : categories && categories.length > 0 ? (
              categories.map((category) => (
                <label key={category.id} className="px-6 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50/70 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{category.name}</p>
                    <p className="text-xs text-zinc-500 mt-1">/{category.slug}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("text-xs font-medium", category.showOnHome ? "text-green-600" : "text-zinc-400")}>Accueil</span>
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                      checked={category.showOnHome}
                      disabled={pendingCategoryId === category.id}
                      onChange={(event) => handleCategoryToggle(category.id, event.target.checked)}
                    />
                  </div>
                </label>
              ))
            ) : (
              <p className="px-6 py-8 text-sm text-zinc-500">Aucune catégorie disponible.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-100">
              <h2 className="text-lg font-display font-medium text-zinc-900">Commandes récentes</h2>
              <p className="text-sm text-zinc-500 mt-1">Les dernières commandes enregistrées dans Supabase.</p>
            </div>
            <div className="divide-y divide-zinc-100">
              {loadingOrders ? (
                <p className="px-6 py-8 text-sm text-zinc-500">Chargement...</p>
              ) : orders && orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order.id} className="px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{order.customerName}</p>
                        <p className="text-xs text-zinc-500 mt-1">{order.customerEmail}</p>
                        <p className="text-xs text-zinc-400 mt-2">#{order.id.slice(0, 8)} • {order.itemsCount} article(s)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-zinc-900">{formatPrice(order.total)}</p>
                        <p className="text-xs uppercase tracking-[0.14em] text-zinc-400 mt-1">{order.status}</p>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 mt-3">{formatDate(order.createdAt)}</p>
                  </div>
                ))
              ) : (
                <p className="px-6 py-8 text-sm text-zinc-500">Aucune commande pour le moment.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
            <h2 className="text-lg font-display font-medium text-zinc-900">Résumé rapide</h2>
            <ul className="mt-4 space-y-3 text-sm text-zinc-600">
              <li>{stats.products} produit(s) actuellement dans le catalogue.</li>
              <li>{stats.categories} catégorie(s) disponibles pour la navigation.</li>
              <li>{stats.homeCategories} catégorie(s) affichées sur l'accueil.</li>
              <li>{stats.featuredProducts} produit(s) dans la sélection du moment.</li>
              <li>{stats.lowStock} produit(s) à surveiller côté réassort.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-medium text-zinc-900">Catalogue produits</h2>
            <p className="text-sm text-zinc-500 mt-1">Activez ici les produits à faire remonter dans “Sélection du moment”.</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Stock faible</p>
            <p className="text-sm font-medium text-amber-600">{stats.lowStock} produit(s)</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 text-xs tracking-widest uppercase text-zinc-500 font-medium">
              <tr>
                <th className="px-6 py-4">Produit</th>
                <th className="px-6 py-4">Catégorie</th>
                <th className="px-6 py-4">Prix</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Sélection</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">Chargement...</td>
                </tr>
              ) : (
                productsData?.products.map((product) => (
                  <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-zinc-100 overflow-hidden flex items-center justify-center flex-shrink-0 border border-zinc-200/60">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-zinc-300" />
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-zinc-900 block">{product.name}</span>
                          <span className="text-xs text-zinc-400">{product.brand || product.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{product.categoryName}</td>
                    <td className="px-6 py-4 font-medium">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase",
                          product.stock > 10
                            ? "bg-green-100 text-green-700"
                            : product.stock > 0
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                        )}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <label className="inline-flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                          checked={product.isFeatured}
                          disabled={pendingProductId === product.id}
                          onChange={(event) => handleProductFeaturedToggle(product.id, event.target.checked)}
                        />
                        <span className={cn("text-xs font-medium", product.isFeatured ? "text-green-600" : "text-zinc-400")}>
                          {product.isFeatured ? "Activé" : "Inactif"}
                        </span>
                      </label>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors bg-white rounded-md shadow-sm border border-zinc-200"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 transition-colors bg-white rounded-md shadow-sm border border-zinc-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <h2 className="font-display font-medium text-lg text-zinc-900">{editingId ? "Modifier le produit" : "Nouveau produit"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">Nom du produit</label>
                  <input {...register("name")} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1.5">Prix (EUR)</label>
                    <input type="number" step="0.01" {...register("price")} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900/10 outline-none" />
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1.5">Stock</label>
                    <input type="number" {...register("stock")} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900/10 outline-none" />
                    {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">Catégorie</label>
                  <select {...register("categoryId")} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900/10 outline-none bg-white">
                    <option value="">Sélectionner...</option>
                    {categories?.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">URL de l'image (optionnel)</label>
                  <input {...register("imageUrl")} placeholder="https://..." className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900/10 outline-none" />
                  {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">Marque (optionnel)</label>
                  <input {...register("brand")} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900/10 outline-none" />
                </div>

                <label className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Sélection du moment</p>
                    <p className="text-xs text-zinc-500 mt-1">Active ce produit pour l'afficher sur la page d'accueil.</p>
                  </div>
                  <input
                    type="checkbox"
                    {...register("isFeatured")}
                    checked={featuredValue}
                    className="h-5 w-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                </label>
              </form>
            </div>

            <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 transition-colors">
                Annuler
              </button>
              <button type="submit" form="product-form" disabled={createProd.isPending || updateProd.isPending} className="px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 rounded-lg shadow-sm hover:bg-zinc-800 transition-colors disabled:opacity-50">
                {createProd.isPending || updateProd.isPending ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
