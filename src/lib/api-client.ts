import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  productCount?: number;
  showOnHome: boolean;
};

export type Product = {
  id: string;
  categoryId?: string | null;
  categoryName?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  promoPrice?: number;
  imageUrl?: string | null;
  images?: string[] | null;
  stock: number;
  sku: string;
  isFeatured: boolean;
  isNew: boolean;
  isPromo: boolean;
  brand?: string | null;
};

export type OrderItem = {
  productName: string;
  quantity: number;
  totalPrice: number;
};

export type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  city: string | null;
  postalCode: string | null;
  total: number;
  items: OrderItem[];
};

export type AgriculturalContactSettings = {
  locationLabel: string;
  locationValue: string;
  phoneLabel: string;
  phoneValue: string;
  emailLabel: string;
  emailValue: string;
};

export type AgriculturalPortfolioItem = {
  id: string;
  name: string;
  season: string;
  imageUrl: string;
  tips: string[];
  colSpan: string;
  sortOrder: number;
};

export type AgriculturalInquiry = {
  id: string;
  name: string;
  email: string;
  message: string;
  replySubject?: string | null;
  replyMessage?: string | null;
  repliedAt?: string | null;
  emailSentAt?: string | null;
  createdAt: string;
};

export type SendInquiryReplyEmailPayload = {
  toEmail: string;
  toName?: string;
  subject?: string;
  replyMessage: string;
  originalMessage?: string;
};

export type SendAgriculturalInquiryPayload = {
  name: string;
  email: string;
  message: string;
};

const defaultAgriculturalContactSettings: AgriculturalContactSettings = {
  locationLabel: "Notre agence",
  locationValue: "République démocratique du Congo, Minova centre commercial, en face de l'hôtel Luna",
  phoneLabel: "Ligne directe",
  phoneValue: "+243 972492668 & +243 971904750",
  emailLabel: "Support expert",
  emailValue: "irmirindibusiness@gmail.com",
};

const defaultAgriculturalPortfolioItems: AgriculturalPortfolioItem[] = [
  {
    id: "fallback-mais",
    name: "Maïs",
    season: "Avril à sept.",
    imageUrl: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&q=80",
    tips: ["Semis à 25 000 plants/ha", "Apport azoté fractionné", "Désherbage précoce"],
    colSpan: "col-span-1 md:col-span-4",
    sortOrder: 1,
  },
  {
    id: "fallback-haricot",
    name: "Haricot",
    season: "Mars à juil.",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80",
    tips: ["Inoculation rhizobium", "Espacement 40×10 cm", "Éviter les excès d'eau"],
    colSpan: "col-span-1 md:col-span-2",
    sortOrder: 2,
  },
  {
    id: "fallback-manioc",
    name: "Manioc",
    season: "Toute l'année",
    imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80",
    tips: ["Boutures saines 25 cm", "Sol bien drainé", "Buttage à 3 mois"],
    colSpan: "col-span-1 md:col-span-2",
    sortOrder: 3,
  },
  {
    id: "fallback-tomate",
    name: "Tomate",
    season: "Jan. à juin",
    imageUrl: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&q=80",
    tips: ["Tuteurage dès 30 cm", "Arrosage au pied", "Fongicide préventif"],
    colSpan: "col-span-1 md:col-span-4",
    sortOrder: 4,
  },
  {
    id: "fallback-riz",
    name: "Riz",
    season: "Juin à nov.",
    imageUrl: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800&q=80",
    tips: ["Repiquage en ligne", "Gestion de l'eau", "Récolte à maturité"],
    colSpan: "col-span-1 md:col-span-3",
    sortOrder: 5,
  },
  {
    id: "fallback-aubergine",
    name: "Aubergine",
    season: "Toute l'année",
    imageUrl: "https://images.unsplash.com/photo-1773901768958-0ed5aaa4913c?auto=format&fit=crop&q=80&w=800",
    tips: ["Repiquage sur sol enrichi", "Arrosage regulier sans exces", "Recolte progressive des fruits"],
    colSpan: "col-span-1 md:col-span-3",
    sortOrder: 6,
  },
];

function mapProduct(row: any): Product {
  const comparePrice = row.compare_price ?? null;
  const isPromo = comparePrice !== null && comparePrice > row.price;
  const price = isPromo ? comparePrice : row.price;
  const promoPrice = isPromo ? row.price : undefined;

  return {
    id: row.id,
    categoryId: row.category_id ?? null,
    categoryName: row.categories?.name ?? null,
    name: row.name,
    slug: row.slug,
    description: row.description ?? null,
    price,
    promoPrice,
    imageUrl: row.image_url ?? null,
    images: row.images ?? null,
    stock: row.stock ?? 0,
    sku: row.sku,
    isFeatured: !!row.is_featured,
    isNew: !!row.is_new,
    isPromo,
    brand: row.brand ?? null,
  };
}

function mapCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? null,
    imageUrl: row.image_url ?? null,
    showOnHome: !!row.show_on_home,
  };
}

function mapAgriculturalContactSettings(row: any | null): AgriculturalContactSettings {
  if (!row) {
    return defaultAgriculturalContactSettings;
  }

  return {
    locationLabel: row.location_label ?? defaultAgriculturalContactSettings.locationLabel,
    locationValue: row.location_value ?? defaultAgriculturalContactSettings.locationValue,
    phoneLabel: row.phone_label ?? defaultAgriculturalContactSettings.phoneLabel,
    phoneValue: row.phone_value ?? defaultAgriculturalContactSettings.phoneValue,
    emailLabel: row.email_label ?? defaultAgriculturalContactSettings.emailLabel,
    emailValue: row.email_value ?? defaultAgriculturalContactSettings.emailValue,
  };
}

function mapAgriculturalPortfolioItem(row: any): AgriculturalPortfolioItem {
  return {
    id: row.id,
    name: row.name,
    season: row.season,
    imageUrl: row.image_url,
    tips: Array.isArray(row.tips) ? row.tips.filter(Boolean) : [],
    colSpan: row.col_span ?? "col-span-1 md:col-span-3",
    sortOrder: row.sort_order ?? 0,
  };
}

function mapAgriculturalInquiry(row: any): AgriculturalInquiry {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    replySubject: row.reply_subject ?? null,
    replyMessage: row.reply_message ?? null,
    repliedAt: row.replied_at ?? null,
    emailSentAt: row.email_sent_at ?? null,
    createdAt: row.created_at,
  };
}

export async function sendInquiryReplyEmail(payload: SendInquiryReplyEmailPayload) {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;

  const token = data.session?.access_token;
  if (!token) {
    throw new Error("Vous devez être connecté en admin pour envoyer un email.");
  }

  const response = await fetch("/api/send-inquiry-reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const result = (await response.json().catch(() => null)) as { message?: string } | null;
  if (!response.ok) {
    throw new Error(result?.message || "Impossible d'envoyer l'email de réponse.");
  }

  return true;
}

export async function sendAgriculturalInquiry(payload: SendAgriculturalInquiryPayload) {
  const { data, error } = await supabase
    .from("agricultural_inquiries")
    .insert({
      name: payload.name,
      email: payload.email,
      message: payload.message,
    })
    .select("id, name, email, message, created_at")
    .single();

  if (error) {
    throw new Error(error.message || "Impossible d'envoyer votre demande.");
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    message: data.message,
    replySubject: null,
    replyMessage: null,
    repliedAt: null,
    emailSentAt: null,
    createdAt: data.created_at,
  } satisfies AgriculturalInquiry;
}

export function useListCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, description, image_url, show_on_home")
        .order("name");

      if (error) throw error;
      return data.map(mapCategory);
    },
  });
}

export function useUpdateCategoryVisibility() {
  return useMutation({
    mutationFn: async (payload: { id: string; showOnHome: boolean }) => {
      const { data, error } = await supabase
        .from("categories")
        .update({ show_on_home: payload.showOnHome })
        .eq("id", payload.id)
        .select("id, name, slug, description, image_url, show_on_home")
        .single();

      if (error) throw error;
      return mapCategory(data);
    },
  });
}

export function useListProducts(params?: {
  category?: string;
  search?: string;
  limit?: number;
  page?: number;
  featured?: boolean;
}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let categoryId: string | null = null;
      if (params?.category) {
        const { data: categoryRow, error: categoryError } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", params.category)
          .maybeSingle();

        if (categoryError) throw categoryError;
        if (!categoryRow) {
          return { products: [], total: 0 };
        }
        categoryId = categoryRow.id;
      }

      let query = supabase
        .from("products")
        .select(
          "id, category_id, name, slug, description, price, compare_price, image_url, images, stock, sku, is_featured, is_new, brand, categories(name, slug)",
          { count: "exact" }
        );

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      if (params?.featured) {
        query = query.eq("is_featured", true);
      }

      if (params?.search) {
        const term = `%${params.search}%`;
        query = query.or(`name.ilike.${term},description.ilike.${term}`);
      }

      const { data, error, count } = await query.range(from, to);
      if (error) throw error;

      return {
        products: data.map(mapProduct),
        total: count ?? 0,
      };
    },
  });
}

export function useGetProduct(id?: string) {
  return useQuery({
    queryKey: ["product", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, category_id, name, slug, description, price, compare_price, image_url, images, stock, sku, is_featured, is_new, brand, categories(name, slug)"
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return mapProduct(data);
    },
  });
}

export function useCreateProduct() {
  return useMutation({
    mutationFn: async (payload: {
      data: {
        name: string;
        price: number;
        categoryId: string;
        stock: number;
        description?: string;
        imageUrl?: string;
        brand?: string;
        isFeatured?: boolean;
      };
    }) => {
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: payload.data.name,
          price: payload.data.price,
          category_id: payload.data.categoryId,
          stock: payload.data.stock,
          description: payload.data.description ?? "",
          image_url: payload.data.imageUrl ?? null,
          brand: payload.data.brand ?? null,
          slug: payload.data.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
          sku: "SKU-" + Date.now(),
          is_featured: !!payload.data.isFeatured,
          is_new: true,
        })
        .select()
        .single();

      if (error) throw error;
      return mapProduct(data);
    },
  });
}

export function useUpdateProduct() {
  return useMutation({
    mutationFn: async (payload: {
      id: string;
      data: {
        name: string;
        price: number;
        categoryId: string;
        stock: number;
        description?: string;
        imageUrl?: string;
        brand?: string;
        isFeatured?: boolean;
      };
    }) => {
      const { data, error } = await supabase
        .from("products")
        .update({
          name: payload.data.name,
          price: payload.data.price,
          category_id: payload.data.categoryId,
          stock: payload.data.stock,
          description: payload.data.description ?? "",
          image_url: payload.data.imageUrl ?? null,
          brand: payload.data.brand ?? null,
          is_featured: !!payload.data.isFeatured,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payload.id)
        .select()
        .single();

      if (error) throw error;
      return mapProduct(data);
    },
  });
}

export function useToggleProductFeatured() {
  return useMutation({
    mutationFn: async (payload: { id: string; isFeatured: boolean }) => {
      const { data, error } = await supabase
        .from("products")
        .update({
          is_featured: payload.isFeatured,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payload.id)
        .select()
        .single();

      if (error) throw error;
      return mapProduct(data);
    },
  });
}

export function useDeleteProduct() {
  return useMutation({
    mutationFn: async (payload: { id: string }) => {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", payload.id);

      if (error) throw error;
      return true;
    },
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (payload: {
      data: {
        customerName: string;
        customerEmail: string;
        shippingAddress: string;
        city: string;
        postalCode: string;
        items: { productId: string; quantity: number }[];
      };
    }) => {
      if (!payload.data.items.length) {
        throw new Error("Votre panier est vide");
      }

      const ids = payload.data.items.map((i) => i.productId);
      const { data: productsRaw, error: prodError } = await supabase
        .from("products")
        .select("id, name, price, compare_price, image_url, stock")
        .in("id", ids);

      if (prodError) throw prodError;

      const products = productsRaw ?? [];
      const productMap = new Map(products.map((p: any) => [p.id, p]));

      let total = 0;
      for (const item of payload.data.items) {
        const product = productMap.get(item.productId);
        if (!product) throw new Error("Produit introuvable");
        if (product.stock !== null && product.stock < item.quantity) {
          throw new Error(`Stock insuffisant pour ${product.name}`);
        }
        total += Number(product.price) * item.quantity;
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          status: "pending",
          total,
          customer_name: payload.data.customerName,
          customer_email: payload.data.customerEmail,
          shipping_address: payload.data.shippingAddress,
          city: payload.data.city,
          postal_code: payload.data.postalCode,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = payload.data.items.map((item) => {
        const product = productMap.get(item.productId);
        return {
          order_id: order.id,
          product_id: item.productId,
          product_name: product.name,
          product_image: product.image_url ?? null,
          quantity: item.quantity,
          price: Number(product.price),
        };
      });

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      for (const item of payload.data.items) {
        const { error: stockError } = await supabase.rpc("decrement_stock", {
          product_id: item.productId,
          quantity: item.quantity,
        });
        if (stockError) throw stockError;
      }

      return order as { id: string };
    },
  });
}

export function useGetOrder(orderId?: string) {
  return useQuery({
    queryKey: ["order", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, customer_name, customer_email, shipping_address, city, postal_code, total, order_items(product_name, quantity, price)")
        .eq("id", orderId)
        .single();

      if (error) throw error;

      const items: OrderItem[] = (data.order_items ?? []).map((item: any) => ({
        productName: item.product_name,
        quantity: item.quantity,
        totalPrice: Number(item.price) * item.quantity,
      }));

      return {
        id: data.id,
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        shippingAddress: data.shipping_address,
        city: data.city ?? null,
        postalCode: data.postal_code ?? null,
        total: Number(data.total),
        items,
      } satisfies Order;
    },
  });
}

export type AdminOrder = {
  id: string;
  customerName: string;
  customerEmail: string;
  status: string;
  total: number;
  createdAt: string;
  itemsCount: number;
};

export function useListOrders(limit: number = 12) {
  return useQuery({
    queryKey: ["admin-orders", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, customer_name, customer_email, status, total, created_at, order_items(id)")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data ?? []).map((row: any) => ({
        id: row.id,
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        status: row.status,
        total: Number(row.total),
        createdAt: row.created_at,
        itemsCount: Array.isArray(row.order_items) ? row.order_items.length : 0,
      })) satisfies AdminOrder[];
    },
  });
}

export function useCreateAgriculturalInquiry() {
  return useMutation({
    mutationFn: sendAgriculturalInquiry,
  });
}

export function useListAgriculturalInquiries(limit: number = 12) {
  return useQuery({
    queryKey: ["agricultural-inquiries", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agricultural_inquiries")
        .select("id, name, email, message, reply_subject, reply_message, replied_at, email_sent_at, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data ?? []).map(mapAgriculturalInquiry);
    },
  });
}

export function useUpdateAgriculturalInquiryReply() {
  return useMutation({
    mutationFn: async (payload: { id: string; replySubject?: string; replyMessage: string; emailSentAt?: string | null }) => {
      const reply = payload.replyMessage.trim();
      const repliedAt = reply ? new Date().toISOString() : null;
      const { data, error } = await supabase
        .from("agricultural_inquiries")
        .update({
          reply_subject: payload.replySubject?.trim() || null,
          reply_message: reply,
          replied_at: repliedAt,
          email_sent_at: payload.emailSentAt ?? null,
        })
        .eq("id", payload.id)
        .select("id, name, email, message, reply_subject, reply_message, replied_at, email_sent_at, created_at")
        .maybeSingle();

      if (error) throw error;
      if (data) {
        return mapAgriculturalInquiry(data);
      }

      const { data: refreshed, error: refreshError } = await supabase
        .from("agricultural_inquiries")
        .select("id, name, email, message, reply_subject, reply_message, replied_at, email_sent_at, created_at")
        .eq("id", payload.id)
        .maybeSingle();

      if (refreshError) throw refreshError;
      if (!refreshed) {
        throw new Error("La réponse a été enregistrée, mais le message mis à jour n'a pas pu être relu.");
      }

      return mapAgriculturalInquiry(refreshed);
    },
  });
}

export function useDeleteAgriculturalInquiry() {
  return useMutation({
    mutationFn: async (payload: { id: string }) => {
      const { error } = await supabase
        .from("agricultural_inquiries")
        .delete()
        .eq("id", payload.id);

      if (error) throw error;
      return true;
    },
  });
}

export function useAgriculturalContactSettings() {
  return useQuery({
    queryKey: ["agricultural-contact-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agricultural_contact_settings")
        .select("location_label, location_value, phone_label, phone_value, email_label, email_value")
        .eq("id", 1)
        .maybeSingle();

      if (error) throw error;
      return mapAgriculturalContactSettings(data);
    },
  });
}

export function useUpsertAgriculturalContactSettings() {
  return useMutation({
    mutationFn: async (payload: AgriculturalContactSettings) => {
      const { data, error } = await supabase
        .from("agricultural_contact_settings")
        .upsert(
          {
            id: 1,
            location_label: payload.locationLabel,
            location_value: payload.locationValue,
            phone_label: payload.phoneLabel,
            phone_value: payload.phoneValue,
            email_label: payload.emailLabel,
            email_value: payload.emailValue,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        )
        .select("location_label, location_value, phone_label, phone_value, email_label, email_value")
        .single();

      if (error) throw error;
      return mapAgriculturalContactSettings(data);
    },
  });
}

export function useAgriculturalPortfolioItems() {
  return useQuery({
    queryKey: ["agricultural-portfolio-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agricultural_portfolio_items")
        .select("id, name, season, image_url, tips, col_span, sort_order")
        .order("sort_order", { ascending: true });

      if (error) throw error;

      const items = (data ?? []).map(mapAgriculturalPortfolioItem);
      return items.length > 0 ? items : defaultAgriculturalPortfolioItems;
    },
  });
}

export function useUpdateAgriculturalPortfolioItem() {
  return useMutation({
    mutationFn: async (payload: AgriculturalPortfolioItem) => {
      const { data, error } = await supabase
        .from("agricultural_portfolio_items")
        .update({
          name: payload.name,
          season: payload.season,
          image_url: payload.imageUrl,
          tips: payload.tips,
          col_span: payload.colSpan,
          sort_order: payload.sortOrder,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payload.id)
        .select("id, name, season, image_url, tips, col_span, sort_order")
        .single();

      if (error) throw error;
      return mapAgriculturalPortfolioItem(data);
    },
  });
}





