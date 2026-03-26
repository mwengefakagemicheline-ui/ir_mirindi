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

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

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
        .select(
          "id, customer_name, customer_email, shipping_address, city, postal_code, total, order_items(product_name, quantity, price)"
        )
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
