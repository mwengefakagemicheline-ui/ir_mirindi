import { useState } from "react";
import {
  useListProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useListCategories,
} from "@/lib/api-client";
import { formatPrice, cn } from "@/lib/utils";
import { Edit2, Trash2, Plus, X, Image as ImageIcon } from "lucide-react";
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
});

type ProductForm = z.infer<typeof productSchema>;

export function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: productsData, isLoading } = useListProducts({ limit: 100 });
  const { data: categories } = useListCategories();

  const createProd = useCreateProduct();
  const updateProd = useUpdateProduct();
  const deleteProd = useDeleteProduct();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      stock: 10,
    },
  });

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
    });
    setIsModalOpen(true);
  };

  const openEdit = (product: any) => {
    setEditingId(product.id);
    reset({
      name: product.name,
      price: product.price,
      categoryId: product.categoryId || "",
      stock: product.stock,
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      brand: product.brand || "",
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
        toast({ title: "Produit mis a jour" });
      } else {
        await createProd.mutateAsync({ data: payload });
        toast({ title: "Produit cree" });
      }
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsModalOpen(false);
    } catch (e) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Etes-vous sur de vouloir supprimer ce produit ?")) {
      try {
        await deleteProd.mutateAsync({ id });
        queryClient.invalidateQueries({ queryKey: ["products"] });
        toast({ title: "Produit supprime" });
      } catch (e) {
        toast({ title: "Erreur", variant: "destructive" });
      }
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

    toast({ title: "Deconnexion reussie" });
    setLocation("/admin/login");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-medium text-zinc-900">
            Administration
          </h1>
          <p className="text-zinc-500 mt-1">Gerez votre catalogue de produits</p>
          {user?.email && (
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-400 mt-3">
              Connecte en tant que {user.email}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSignOut}
            className="bg-white text-zinc-700 px-5 py-2.5 rounded-lg text-sm font-medium border border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm"
          >
            Deconnexion
          </button>
          <button
            onClick={openCreate}
            className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Nouveau Produit
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 text-xs tracking-widest uppercase text-zinc-500 font-medium">
              <tr>
                <th className="px-6 py-4">Produit</th>
                <th className="px-6 py-4">Categorie</th>
                <th className="px-6 py-4">Prix</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    Chargement...
                  </td>
                </tr>
              ) : (
                productsData?.products.map((product) => (
                  <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-zinc-100 overflow-hidden flex items-center justify-center flex-shrink-0 border border-zinc-200/60">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-zinc-300" />
                        )}
                      </div>
                      <span className="font-medium text-zinc-900">{product.name}</span>
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
                              : "bg-red-100 text-red-700",
                        )}
                      >
                        {product.stock}
                      </span>
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
          <div
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <h2 className="font-display font-medium text-lg text-zinc-900">
                {editingId ? "Modifier le produit" : "Nouveau produit"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">Nom du produit</label>
                  <input
                    {...register("name")}
                    className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1.5">Prix (EUR)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("price")}
                      className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900/10 outline-none"
                    />
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1.5">Stock</label>
                    <input
                      type="number"
                      {...register("stock")}
                      className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900/10 outline-none"
                    />
                    {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">Categorie</label>
                  <select
                    {...register("categoryId")}
                    className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900/10 outline-none bg-white"
                  >
                    <option value="">Selectionner...</option>
                    {categories?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">URL de l'image (optionnel)</label>
                  <input
                    {...register("imageUrl")}
                    placeholder="https://..."
                    className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900/10 outline-none"
                  />
                  {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">Marque (optionnel)</label>
                  <input
                    {...register("brand")}
                    className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900/10 outline-none"
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="product-form"
                disabled={createProd.isPending || updateProd.isPending}
                className="px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 rounded-lg shadow-sm hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                {createProd.isPending || updateProd.isPending ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
