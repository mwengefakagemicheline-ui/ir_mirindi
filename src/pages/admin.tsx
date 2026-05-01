import { useEffect, useMemo, useState } from "react";
import {
  useListProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useListCategories,
  useListOrders,
  useUpdateCategoryVisibility,
  useToggleProductFeatured,
  useAgriculturalContactSettings,
  useUpsertAgriculturalContactSettings,
  useAgriculturalPortfolioItems,
  useUpdateAgriculturalPortfolioItem,
  useListAgriculturalInquiries,
  useDeleteAgriculturalInquiry,
  useUpdateAgriculturalInquiryReply,
  sendInquiryReplyEmail,
  type AgriculturalInquiry,
  type AgriculturalPortfolioItem,
} from "@/lib/api-client";
import { useRef } from "react";
import { formatPrice, cn } from "@/lib/utils";
import { Edit2, Trash2, Plus, X, Package, Tags, Boxes, ShoppingCart, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { getProductImage } from "@/lib/image-fallbacks";

const productSchema = z.object({
  name: z.string().min(2, "Requis"),
  price: z.coerce.number().min(0.01, "Requis"),
  categoryId: z.string().min(1, "Requis"),
  stock: z.coerce.number().min(0, "Requis"),
  description: z.string().optional(),
  imageUrl: z
    .string()
    .trim()
    .refine((value) => value === "" || value.startsWith("/") || /^https?:\/\//i.test(value) || /^data:image\//i.test(value), {
      message: "Entrez une URL web, un chemin local commençant par / ou choisissez une image",
    })
    .optional(),
  brand: z.string().optional(),
  isFeatured: z.boolean().default(false),
});

const agriculturalContactSchema = z.object({
  locationLabel: z.string().min(2, "Requis"),
  locationValue: z.string().min(5, "Requis"),
  phoneLabel: z.string().min(2, "Requis"),
  phoneValue: z.string().min(5, "Requis"),
  emailLabel: z.string().min(2, "Requis"),
  emailValue: z.string().email("Email invalide"),
});

type ProductForm = z.infer<typeof productSchema>;
type AgriculturalContactForm = z.infer<typeof agriculturalContactSchema>;

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

function tipsToText(tips: string[]) {
  return tips.join("\n");
}

function textToTips(value: string) {
  return value
    .split("\n")
    .map((tip) => tip.trim())
    .filter(Boolean);
}

export function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: productsData, isLoading } = useListProducts({ limit: 100 });
  const { data: categories, isLoading: loadingCategories } = useListCategories();
  const { data: orders, isLoading: loadingOrders } = useListOrders(8);
  const { data: agriculturalContactSettings, isLoading: loadingAgriculturalContact } = useAgriculturalContactSettings();
  const { data: agriculturalPortfolioItems, isLoading: loadingAgriculturalPortfolio } = useAgriculturalPortfolioItems();
  const { data: agriculturalInquiries, isLoading: loadingAgriculturalInquiries } = useListAgriculturalInquiries(12);

  const createProd = useCreateProduct();
  const updateProd = useUpdateProduct();
  const deleteProd = useDeleteProduct();
  const updateCategoryVisibility = useUpdateCategoryVisibility();
  const toggleProductFeatured = useToggleProductFeatured();
  const upsertAgriculturalContactSettings = useUpsertAgriculturalContactSettings();
  const updateAgriculturalPortfolioItem = useUpdateAgriculturalPortfolioItem();
  const deleteAgriculturalInquiry = useDeleteAgriculturalInquiry();
  const updateAgriculturalInquiryReply = useUpdateAgriculturalInquiryReply();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null);
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);
  const [portfolioDrafts, setPortfolioDrafts] = useState<Record<string, AgriculturalPortfolioItem>>({});
  const [inquiryReplies, setInquiryReplies] = useState<Record<string, string>>({});
  const [inquirySubjects, setInquirySubjects] = useState<Record<string, string>>({});
  const [pendingPortfolioId, setPendingPortfolioId] = useState<string | null>(null);
  const [pendingInquiryId, setPendingInquiryId] = useState<string | null>(null);
  const productImageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!agriculturalPortfolioItems) return;
    const nextDrafts = agriculturalPortfolioItems.reduce<Record<string, AgriculturalPortfolioItem>>((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
    setPortfolioDrafts(nextDrafts);
  }, [agriculturalPortfolioItems]);

  useEffect(() => {
    if (!agriculturalInquiries) return;
    const nextReplies = agriculturalInquiries.reduce<Record<string, string>>((acc, item) => {
      acc[item.id] = item.replyMessage ?? "";
      return acc;
    }, {});
    const nextSubjects = agriculturalInquiries.reduce<Record<string, string>>((acc, item) => {
      acc[item.id] = item.replySubject ?? "Reponse a votre demande";
      return acc;
    }, {});
    setInquiryReplies(nextReplies);
    setInquirySubjects(nextSubjects);
  }, [agriculturalInquiries]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      stock: 10,
      isFeatured: false,
    },
  });

  const {
    register: registerAgriculturalContact,
    handleSubmit: handleSubmitAgriculturalContact,
    reset: resetAgriculturalContact,
    formState: { errors: agriculturalContactErrors },
  } = useForm<AgriculturalContactForm>({
    resolver: zodResolver(agriculturalContactSchema),
    values: agriculturalContactSettings,
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
    reset({ name: "", price: 0, categoryId: "", stock: 10, description: "", imageUrl: "", brand: "", isFeatured: false });
    if (productImageInputRef.current) productImageInputRef.current.value = "";
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
    if (productImageInputRef.current) productImageInputRef.current.value = "";
    setIsModalOpen(true);
  };

  const onSubmit = async (data: ProductForm) => {
    try {
      const payload = { ...data, imageUrl: data.imageUrl?.trim() || undefined };
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
      if (productImageInputRef.current) productImageInputRef.current.value = "";
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleProductImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Format invalide", description: "Choisissez uniquement une image.", variant: "destructive" });
      event.target.value = "";
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast({
        title: "Image trop lourde",
        description: "Choisissez une image de moins de 3 Mo pour garder un site rapide.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setValue("imageUrl", result, { shouldDirty: true, shouldValidate: true });
      toast({ title: "Image ajoutée", description: "L'aperçu du produit a été mis à jour." });
    };
    reader.onerror = () => {
      toast({ title: "Erreur", description: "Impossible de lire cette image.", variant: "destructive" });
    };
    reader.readAsDataURL(file);
  };

  const onSubmitAgriculturalContact = async (data: AgriculturalContactForm) => {
    try {
      await upsertAgriculturalContactSettings.mutateAsync(data);
      resetAgriculturalContact(data);
      queryClient.invalidateQueries({ queryKey: ["agricultural-contact-settings"] });
      toast({ title: "Coordonnées agricoles mises à jour" });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer ces coordonnées.", variant: "destructive" });
    }
  };

  const handlePortfolioChange = (id: string, field: keyof AgriculturalPortfolioItem, value: string | number | string[]) => {
    setPortfolioDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: value,
      },
    }));
  };

  const handleSavePortfolioItem = async (id: string) => {
    const draft = portfolioDrafts[id];
    if (!draft) return;

    try {
      setPendingPortfolioId(id);
      await updateAgriculturalPortfolioItem.mutateAsync(draft);
      queryClient.invalidateQueries({ queryKey: ["agricultural-portfolio-items"] });
      toast({ title: "Carte agronomique mise à jour" });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer cette carte.", variant: "destructive" });
    } finally {
      setPendingPortfolioId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        await deleteProd.mutateAsync({ id });
        queryClient.setQueriesData(
          { queryKey: ["products"] },
          (current: { products?: DashboardProduct[]; total?: number } | undefined) =>
            current
              ? {
                  ...current,
                  products: (current.products ?? []).filter((product) => product.id !== id),
                  total: Math.max((current.total ?? 1) - 1, 0),
                }
              : current
        );
        queryClient.invalidateQueries({ queryKey: ["products"] });
        toast({ title: "Produit supprimé" });
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: error?.message || "Impossible de supprimer ce produit.",
          variant: "destructive",
        });
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

  const handleDeleteAgriculturalInquiry = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) return;

    try {
      setPendingInquiryId(id);
      await deleteAgriculturalInquiry.mutateAsync({ id });
      queryClient.setQueriesData(
        { queryKey: ["agricultural-inquiries"] },
        (current: AgriculturalInquiry[] | undefined) =>
          current ? current.filter((item) => item.id !== id) : current
      );
      queryClient.invalidateQueries({ queryKey: ["agricultural-inquiries"] });
      toast({ title: "Message supprimé" });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de supprimer ce message.",
        variant: "destructive",
      });
    } finally {
      setPendingInquiryId(null);
    }
  };

  const handleSaveInquiryReply = async (id: string) => {
    try {
      const inquiry = agriculturalInquiries?.find((item) => item.id === id);
      if (!inquiry) {
        throw new Error("Message introuvable.");
      }

      const replyMessage = (inquiryReplies[id] ?? "").trim();
      const replySubject = (inquirySubjects[id] ?? "").trim();
      if (!replyMessage) {
        throw new Error("Ajoutez une réponse avant l'envoi.");
      }

      setPendingInquiryId(id);
      await sendInquiryReplyEmail({
        toEmail: inquiry.email,
        toName: inquiry.name,
        subject: replySubject,
        replyMessage,
        originalMessage: inquiry.message,
      });

      const updated = await updateAgriculturalInquiryReply.mutateAsync({
        id,
        replySubject,
        replyMessage,
        emailSentAt: new Date().toISOString(),
      });
      queryClient.setQueriesData(
        { queryKey: ["agricultural-inquiries"] },
        (current: AgriculturalInquiry[] | undefined) =>
          current ? current.map((item) => (item.id === id ? updated : item)) : current
      );
      queryClient.invalidateQueries({ queryKey: ["agricultural-inquiries"] });
      toast({ title: "Réponse envoyée par email" });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error?.message || "Impossible d'envoyer cette réponse.",
        variant: "destructive",
      });
    } finally {
      setPendingInquiryId(null);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
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
  const imageValue = watch("imageUrl");
  const productPreviewImage = getProductImage({
    imageUrl: imageValue,
    categoryName: "",
    brand: watch("brand"),
    name: watch("name"),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-display font-medium text-zinc-900">Dashboard admin</h1>
          <p className="text-zinc-500 mt-1">Gérez les produits, surveillez le stock et contrôlez l'accueil depuis ici.</p>
          {user?.email && <p className="text-xs uppercase tracking-[0.18em] text-zinc-400 mt-3">Connecté en tant que {user.email}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSignOut} className="bg-white text-zinc-700 px-5 py-2.5 rounded-lg text-sm font-medium border border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm">Déconnexion</button>
          <button onClick={openCreate} className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-zinc-800 transition-colors shadow-sm"><Plus className="w-4 h-4" /> Nouveau produit</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-5"><span className="text-xs uppercase tracking-[0.2em] text-zinc-500">{card.label}</span><div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700"><Icon className="w-4 h-4" /></div></div>
              <p className="text-3xl font-display font-medium text-zinc-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between gap-4"><div><h2 className="text-lg font-display font-medium text-zinc-900">Accueil: catégories</h2><p className="text-sm text-zinc-500 mt-1">Cochez les catégories à afficher dans “Nos univers”.</p></div><div className="text-right"><p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Actives</p><p className="text-sm font-medium text-zinc-900">{stats.homeCategories}</p></div></div>
          <div className="divide-y divide-zinc-100">
            {loadingCategories ? <p className="px-6 py-8 text-sm text-zinc-500">Chargement...</p> : categories && categories.length > 0 ? categories.map((category) => (
              <label key={category.id} className="px-6 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50/70 transition-colors"><div><p className="text-sm font-medium text-zinc-900">{category.name}</p><p className="text-xs text-zinc-500 mt-1">/{category.slug}</p></div><div className="flex items-center gap-3"><span className={cn("text-xs font-medium", category.showOnHome ? "text-green-600" : "text-zinc-400")}>Accueil</span><input type="checkbox" className="h-5 w-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" checked={category.showOnHome} disabled={pendingCategoryId === category.id} onChange={(event) => handleCategoryToggle(category.id, event.target.checked)} /></div></label>
            )) : <p className="px-6 py-8 text-sm text-zinc-500">Aucune catégorie disponible.</p>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-100"><h2 className="text-lg font-display font-medium text-zinc-900">Commandes récentes</h2><p className="text-sm text-zinc-500 mt-1">Les dernières commandes enregistrées dans Supabase.</p></div>
            <div className="divide-y divide-zinc-100">
              {loadingOrders ? <p className="px-6 py-8 text-sm text-zinc-500">Chargement...</p> : orders && orders.length > 0 ? orders.map((order) => (
                <div key={order.id} className="px-6 py-4"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-zinc-900">{order.customerName}</p><p className="text-xs text-zinc-500 mt-1">{order.customerEmail}</p><p className="text-xs text-zinc-400 mt-2">#{order.id.slice(0, 8)} • {order.itemsCount} article(s)</p></div><div className="text-right"><p className="text-sm font-medium text-zinc-900">{formatPrice(order.total)}</p><p className="text-xs uppercase tracking-[0.14em] text-zinc-400 mt-1">{order.status}</p></div></div><p className="text-xs text-zinc-400 mt-3">{formatDate(order.createdAt)}</p></div>
              )) : <p className="px-6 py-8 text-sm text-zinc-500">Aucune commande pour le moment.</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-100"><h2 className="text-lg font-display font-medium text-zinc-900">Messages du site</h2><p className="text-sm text-zinc-500 mt-1">Demandes envoyées depuis le formulaire agricole.</p></div>
            <div className="divide-y divide-zinc-100">
              {loadingAgriculturalInquiries ? <p className="px-6 py-8 text-sm text-zinc-500">Chargement...</p> : agriculturalInquiries && agriculturalInquiries.length > 0 ? agriculturalInquiries.map((item) => (
                <div key={item.id} className="px-6 py-4"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-zinc-900">{item.name}</p><p className="text-xs text-zinc-500 mt-1">{item.email}</p></div><div className="text-right"><p className="text-xs text-zinc-400">{formatDate(item.createdAt)}</p>{item.repliedAt && <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.15em] text-green-600">Répondu le {formatDate(item.repliedAt)}</p>}{item.emailSentAt && <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.15em] text-blue-600">Email envoyé le {formatDate(item.emailSentAt)}</p>}<button type="button" onClick={() => handleDeleteAgriculturalInquiry(item.id)} disabled={pendingInquiryId === item.id} className="mt-3 inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">{pendingInquiryId === item.id ? "Suppression..." : "Supprimer"}</button></div></div><p className="text-sm text-zinc-600 mt-3 whitespace-pre-line">{item.message}</p><div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4"><p className="text-xs font-medium uppercase tracking-[0.15em] text-zinc-500 mb-3">Répondre à : {item.email}</p><label className="block text-xs font-medium uppercase tracking-[0.15em] text-zinc-500 mb-2">Objet de l'email</label><input type="text" value={inquirySubjects[item.id] ?? ""} onChange={(event) => setInquirySubjects((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Reponse a votre demande" className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-900/10 mb-4" /><label className="block text-xs font-medium uppercase tracking-[0.15em] text-zinc-500 mb-2">Réponse admin</label><textarea rows={4} value={inquiryReplies[item.id] ?? ""} onChange={(event) => setInquiryReplies((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Écrivez votre réponse ici..." className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-900/10 resize-y" /><div className="mt-3 flex items-center justify-end"><button type="button" onClick={() => handleSaveInquiryReply(item.id)} disabled={pendingInquiryId === item.id} className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50">{pendingInquiryId === item.id ? "Enregistrement..." : "Envoyer la réponse"}</button></div></div></div>
              )) : <p className="px-6 py-8 text-sm text-zinc-500">Aucun message reçu pour le moment.</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6"><h2 className="text-lg font-display font-medium text-zinc-900">Résumé rapide</h2><ul className="mt-4 space-y-3 text-sm text-zinc-600"><li>{stats.products} produit(s) actuellement dans le catalogue.</li><li>{stats.categories} catégorie(s) disponibles pour la navigation.</li><li>{stats.homeCategories} catégorie(s) affichées sur l'accueil.</li><li>{stats.featuredProducts} produit(s) dans la sélection du moment.</li><li>{stats.lowStock} produit(s) à surveiller côté réassort.</li></ul></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6"><div><h2 className="text-lg font-display font-medium text-zinc-900">Portefeuille agronomique</h2><p className="text-sm text-zinc-500 mt-1">Modifiez ici les cartes, images, saisons et conseils affichés sur la page agricole.</p></div></div>
        {loadingAgriculturalPortfolio ? <p className="text-sm text-zinc-500">Chargement...</p> : <div className="space-y-6">{agriculturalPortfolioItems?.map((item, index) => {
          const draft = portfolioDrafts[item.id] ?? item;
          return (
            <div key={item.id} className="rounded-2xl border border-zinc-200 p-5 bg-zinc-50/60">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-zinc-700 mb-1.5">Nom</label><input value={draft.name} onChange={(e) => handlePortfolioChange(item.id, "name", e.target.value)} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10" /></div>
                <div><label className="block text-xs font-medium text-zinc-700 mb-1.5">Saison</label><input value={draft.season} onChange={(e) => handlePortfolioChange(item.id, "season", e.target.value)} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10" /></div>
                <div className="md:col-span-2"><label className="block text-xs font-medium text-zinc-700 mb-1.5">Image URL</label><input value={draft.imageUrl} onChange={(e) => handlePortfolioChange(item.id, "imageUrl", e.target.value)} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10" /></div>
                <div><label className="block text-xs font-medium text-zinc-700 mb-1.5">Disposition</label><select value={draft.colSpan} onChange={(e) => handlePortfolioChange(item.id, "colSpan", e.target.value)} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 bg-white"><option value="col-span-1 md:col-span-2">Petite carte</option><option value="col-span-1 md:col-span-3">Moyenne carte</option><option value="col-span-1 md:col-span-4">Grande carte</option></select></div>
                <div><label className="block text-xs font-medium text-zinc-700 mb-1.5">Ordre</label><input type="number" value={draft.sortOrder} onChange={(e) => handlePortfolioChange(item.id, "sortOrder", Number(e.target.value))} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10" /></div>
                <div className="md:col-span-2"><label className="block text-xs font-medium text-zinc-700 mb-1.5">Conseils (une ligne = un conseil)</label><textarea rows={4} value={tipsToText(draft.tips)} onChange={(e) => handlePortfolioChange(item.id, "tips", textToTips(e.target.value))} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 resize-y" /></div>
                <div className="md:col-span-2 flex items-center justify-between gap-4"><p className="text-xs text-zinc-500">Carte {index + 1}</p><button type="button" onClick={() => handleSavePortfolioItem(item.id)} disabled={pendingPortfolioId === item.id} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 disabled:opacity-50"><Save className="w-4 h-4" />{pendingPortfolioId === item.id ? "Enregistrement..." : "Enregistrer cette carte"}</button></div>
              </div>
            </div>
          );
        })}</div>}
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6"><div><h2 className="text-lg font-display font-medium text-zinc-900">Coordonnées page agricole</h2><p className="text-sm text-zinc-500 mt-1">Ces informations s'affichent sur la page agricole et sont modifiables par l'admin.</p></div></div>
        {loadingAgriculturalContact ? <p className="text-sm text-zinc-500">Chargement...</p> : <form onSubmit={handleSubmitAgriculturalContact(onSubmitAgriculturalContact)} className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-xs font-medium text-zinc-700 mb-1.5">Libellé adresse</label><input {...registerAgriculturalContact("locationLabel")} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10" />{agriculturalContactErrors.locationLabel && <p className="text-red-500 text-xs mt-1">{agriculturalContactErrors.locationLabel.message}</p>}</div><div><label className="block text-xs font-medium text-zinc-700 mb-1.5">Adresse</label><input {...registerAgriculturalContact("locationValue")} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10" />{agriculturalContactErrors.locationValue && <p className="text-red-500 text-xs mt-1">{agriculturalContactErrors.locationValue.message}</p>}</div><div><label className="block text-xs font-medium text-zinc-700 mb-1.5">Libellé téléphone</label><input {...registerAgriculturalContact("phoneLabel")} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10" />{agriculturalContactErrors.phoneLabel && <p className="text-red-500 text-xs mt-1">{agriculturalContactErrors.phoneLabel.message}</p>}</div><div><label className="block text-xs font-medium text-zinc-700 mb-1.5">Téléphone</label><input {...registerAgriculturalContact("phoneValue")} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10" />{agriculturalContactErrors.phoneValue && <p className="text-red-500 text-xs mt-1">{agriculturalContactErrors.phoneValue.message}</p>}</div><div><label className="block text-xs font-medium text-zinc-700 mb-1.5">Libellé email</label><input {...registerAgriculturalContact("emailLabel")} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10" />{agriculturalContactErrors.emailLabel && <p className="text-red-500 text-xs mt-1">{agriculturalContactErrors.emailLabel.message}</p>}</div><div><label className="block text-xs font-medium text-zinc-700 mb-1.5">Email</label><input {...registerAgriculturalContact("emailValue")} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10" />{agriculturalContactErrors.emailValue && <p className="text-red-500 text-xs mt-1">{agriculturalContactErrors.emailValue.message}</p>}</div><div className="md:col-span-2 flex justify-end"><button type="submit" disabled={upsertAgriculturalContactSettings.isPending} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 rounded-lg shadow-sm hover:bg-zinc-800 transition-colors disabled:opacity-50"><Save className="w-4 h-4" />{upsertAgriculturalContactSettings.isPending ? "Enregistrement..." : "Enregistrer les coordonnées"}</button></div></form>}
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between"><div><h2 className="text-lg font-display font-medium text-zinc-900">Catalogue produits</h2><p className="text-sm text-zinc-500 mt-1">Activez ici les produits à faire remonter dans “Sélection du moment”.</p></div><div className="text-right"><p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Stock faible</p><p className="text-sm font-medium text-amber-600">{stats.lowStock} produit(s)</p></div></div>
        <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-zinc-50 text-xs tracking-widest uppercase text-zinc-500 font-medium"><tr><th className="px-6 py-4">Produit</th><th className="px-6 py-4">Catégorie</th><th className="px-6 py-4">Prix</th><th className="px-6 py-4">Stock</th><th className="px-6 py-4">Sélection</th><th className="px-6 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-zinc-100">{isLoading ? <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-500">Chargement...</td></tr> : productsData?.products.map((product) => (<tr key={product.id} className="hover:bg-zinc-50/50 transition-colors"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded bg-zinc-100 overflow-hidden flex items-center justify-center flex-shrink-0 border border-zinc-200/60"><img src={getProductImage(product)} alt={product.name} className="w-full h-full object-cover" /></div><div><span className="font-medium text-zinc-900 block">{product.name}</span><span className="text-xs text-zinc-400">{product.brand || product.sku}</span></div></div></td><td className="px-6 py-4 text-zinc-600">{product.categoryName}</td><td className="px-6 py-4 font-medium">{formatPrice(product.price)}</td><td className="px-6 py-4"><span className={cn("px-2 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase", product.stock > 10 ? "bg-green-100 text-green-700" : product.stock > 0 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>{product.stock}</span></td><td className="px-6 py-4"><label className="inline-flex items-center gap-3 cursor-pointer"><input type="checkbox" className="h-5 w-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" checked={product.isFeatured} disabled={pendingProductId === product.id} onChange={(event) => handleProductFeaturedToggle(product.id, event.target.checked)} /><span className={cn("text-xs font-medium", product.isFeatured ? "text-green-600" : "text-zinc-400")}>{product.isFeatured ? "Activé" : "Inactif"}</span></label></td><td className="px-6 py-4 text-right space-x-2"><button type="button" onClick={() => openEdit(product)} className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors bg-white rounded-md shadow-sm border border-zinc-200"><Edit2 className="w-4 h-4" /></button><button type="button" onClick={() => handleDelete(product.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors bg-white rounded-md shadow-sm border border-zinc-200"><Trash2 className="w-4 h-4" /></button></td></tr>))}</tbody></table></div>
      </div>

      {isModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"><div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div><div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"><div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50"><h2 className="font-display font-medium text-lg text-zinc-900">{editingId ? "Modifier le produit" : "Nouveau produit"}</h2><button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-900"><X className="w-5 h-5" /></button></div><div className="p-6 overflow-y-auto flex-1 custom-scrollbar"><form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5"><div><label className="block text-xs font-medium text-zinc-700 mb-1.5">Nom du produit</label><input {...register("name")} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none" />{errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}</div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-medium text-zinc-700 mb-1.5">Prix (EUR)</label><input type="number" step="0.01" {...register("price")} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900/10 outline-none" />{errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}</div><div><label className="block text-xs font-medium text-zinc-700 mb-1.5">Stock</label><input type="number" {...register("stock")} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900/10 outline-none" />{errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}</div></div><div><label className="block text-xs font-medium text-zinc-700 mb-1.5">Catégorie</label><select {...register("categoryId")} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900/10 outline-none bg-white"><option value="">Sélectionner...</option>{categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>{errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}</div><div><div className="flex items-center justify-between mb-1.5"><label className="block text-xs font-medium text-zinc-700">Image du produit (optionnel)</label><button type="button" onClick={() => productImageInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"><Plus className="w-3.5 h-3.5" /> Ajouter depuis la galerie</button></div><input ref={productImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleProductImageSelect} /><div className="mb-3 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50"><img src={productPreviewImage} alt="Aperçu du produit" className="h-48 w-full object-cover" /></div><input {...register("imageUrl")} placeholder="/images/fer-a-repasser.jpeg ou https://..." className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900/10 outline-none" />{errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>}<p className="text-[11px] text-zinc-500 mt-1.5">Sur téléphone, le bouton + ouvre directement la galerie. Vous pouvez aussi garder une URL web, un chemin local dans <span className="font-medium">public/images</span>, ou l'image choisie depuis l'appareil.</p></div><div><label className="block text-xs font-medium text-zinc-700 mb-1.5">Marque (optionnel)</label><input {...register("brand")} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900/10 outline-none" /></div><label className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 cursor-pointer"><div><p className="text-sm font-medium text-zinc-900">Sélection du moment</p><p className="text-xs text-zinc-500 mt-1">Active ce produit pour l'afficher sur la page d'accueil.</p></div><input type="checkbox" {...register("isFeatured")} checked={featuredValue} className="h-5 w-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" /></label></form></div><div className="p-6 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3"><button type="button" onClick={() => { setIsModalOpen(false); if (productImageInputRef.current) productImageInputRef.current.value = ""; }} className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 transition-colors">Annuler</button><button type="submit" form="product-form" disabled={createProd.isPending || updateProd.isPending} className="px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 rounded-lg shadow-sm hover:bg-zinc-800 transition-colors disabled:opacity-50">{createProd.isPending || updateProd.isPending ? "Enregistrement..." : "Enregistrer"}</button></div></div></div>}
    </div>
  );
}





