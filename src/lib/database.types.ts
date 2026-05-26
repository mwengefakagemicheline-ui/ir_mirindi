export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          image_url?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          category_id: string | null
          name: string
          slug: string
          description: string
          price: number
          compare_price: number | null
          image_url: string | null
          images: string[]
          stock: number
          sku: string
          is_featured: boolean
          is_new: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          name: string
          slug: string
          description?: string
          price: number
          compare_price?: number | null
          image_url?: string | null
          images?: string[]
          stock?: number
          sku: string
          is_featured?: boolean
          is_new?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string | null
          name?: string
          slug?: string
          description?: string
          price?: number
          compare_price?: number | null
          image_url?: string | null
          images?: string[]
          stock?: number
          sku?: string
          is_featured?: boolean
          is_new?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
          total: number
          customer_name: string
          customer_email: string
          customer_phone: string | null
          shipping_address: string
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
          total: number
          customer_name: string
          customer_email: string
          customer_phone?: string | null
          shipping_address: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
          total?: number
          customer_name?: string
          customer_email?: string
          customer_phone?: string | null
          shipping_address?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_image: string | null
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_image?: string | null
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_image?: string | null
          quantity?: number
          price?: number
          created_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
