export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address_1: string
          address_2: string | null
          city: string
          country_code: string
          created_at: string
          customer_id: string | null
          first_name: string | null
          id: string
          is_default: boolean
          label: string
          last_name: string | null
          phone: string | null
          postal_code: string
          state: string
        }
        Insert: {
          address_1: string
          address_2?: string | null
          city: string
          country_code?: string
          created_at?: string
          customer_id?: string | null
          first_name?: string | null
          id?: string
          is_default?: boolean
          label?: string
          last_name?: string | null
          phone?: string | null
          postal_code: string
          state: string
        }
        Update: {
          address_1?: string
          address_2?: string | null
          city?: string
          country_code?: string
          created_at?: string
          customer_id?: string | null
          first_name?: string | null
          id?: string
          is_default?: boolean
          label?: string
          last_name?: string | null
          phone?: string | null
          postal_code?: string
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          quantity: number
          unit_price: number
          variant_id: string
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          quantity: number
          unit_price: number
          variant_id: string
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          quantity?: number
          unit_price?: number
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          customer_id: string | null
          email: string | null
          id: string
          metadata: Json
          region_id: string | null
          shipping_address_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          email?: string | null
          id?: string
          metadata?: Json
          region_id?: string | null
          shipping_address_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          email?: string | null
          id?: string
          metadata?: Json
          region_id?: string | null
          shipping_address_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carts_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carts_shipping_address_id_fkey"
            columns: ["shipping_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          handle: string
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string
          handle: string
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string
          handle?: string
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      chunks: {
        Row: {
          chunk_index: number | null
          content: string
          content_fts: unknown
          created_at: string
          document_id: string
          embedding: string | null
          id: string
          metadata: Json | null
          workspace_id: string
        }
        Insert: {
          chunk_index?: number | null
          content: string
          content_fts?: unknown
          created_at?: string
          document_id: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          workspace_id: string
        }
        Update: {
          chunk_index?: number | null
          content?: string
          content_fts?: unknown
          created_at?: string
          document_id?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          handle: string
          hero_images: string[]
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          handle: string
          hero_images?: string[]
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          handle?: string
          hero_images?: string[]
          id?: string
          title?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          content_hash: string | null
          created_at: string
          file_path: string | null
          filename: string
          id: string
          workspace_id: string
        }
        Insert: {
          content_hash?: string | null
          created_at?: string
          file_path?: string | null
          filename: string
          id?: string
          workspace_id: string
        }
        Update: {
          content_hash?: string | null
          created_at?: string
          file_path?: string | null
          filename?: string
          id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          id: string
          sku: string | null
          variant_id: string
        }
        Insert: {
          id?: string
          sku?: string | null
          variant_id: string
        }
        Update: {
          id?: string
          sku?: string | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: true
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_levels: {
        Row: {
          id: string
          inventory_item_id: string
          location_id: string
          reserved_quantity: number
          stocked_quantity: number
        }
        Insert: {
          id?: string
          inventory_item_id: string
          location_id: string
          reserved_quantity?: number
          stocked_quantity?: number
        }
        Update: {
          id?: string
          inventory_item_id?: string
          location_id?: string
          reserved_quantity?: number
          stocked_quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_levels_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_levels_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          gstin: string | null
          id: string
          invoice_number: string
          issued_at: string
          order_id: string
          pdf_url: string | null
        }
        Insert: {
          gstin?: string | null
          id?: string
          invoice_number: string
          issued_at?: string
          order_id: string
          pdf_url?: string | null
        }
        Update: {
          gstin?: string | null
          id?: string
          invoice_number?: string
          issued_at?: string
          order_id?: string
          pdf_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: Json | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          address?: Json | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          address?: Json | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          citations: Json | null
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
        }
        Insert: {
          citations?: Json | null
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
        }
        Update: {
          citations?: Json | null
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          quantity: number
          sku: string | null
          tax_amount: number
          tax_rate: number
          title: string
          unit_price: number
          variant_id: string | null
          variant_title: string | null
        }
        Insert: {
          id?: string
          order_id: string
          quantity: number
          sku?: string | null
          tax_amount?: number
          tax_rate?: number
          title: string
          unit_price: number
          variant_id?: string | null
          variant_title?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          quantity?: number
          sku?: string | null
          tax_amount?: number
          tax_rate?: number
          title?: string
          unit_price?: number
          variant_id?: string | null
          variant_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_status: string | null
          id: string
          note: string | null
          order_id: string
          to_status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          order_id: string
          to_status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          order_id?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          cod_fee: number
          created_at: string
          created_by_admin: string | null
          currency_code: string
          customer_id: string | null
          discount_total: number
          display_id: number
          email: string
          fulfillment_status: Database["public"]["Enums"]["fulfillment_status"]
          id: string
          idempotency_key: string | null
          is_draft: boolean
          metadata: Json
          payment_method: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          region_id: string | null
          shipping_address: Json
          shipping_total: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax_total: number
          total: number
          updated_at: string
        }
        Insert: {
          billing_address?: Json | null
          cod_fee?: number
          created_at?: string
          created_by_admin?: string | null
          currency_code?: string
          customer_id?: string | null
          discount_total?: number
          display_id?: number
          email: string
          fulfillment_status?: Database["public"]["Enums"]["fulfillment_status"]
          id?: string
          idempotency_key?: string | null
          is_draft?: boolean
          metadata?: Json
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          region_id?: string | null
          shipping_address: Json
          shipping_total?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax_total?: number
          total?: number
          updated_at?: string
        }
        Update: {
          billing_address?: Json | null
          cod_fee?: number
          created_at?: string
          created_by_admin?: string | null
          currency_code?: string
          customer_id?: string | null
          discount_total?: number
          display_id?: number
          email?: string
          fulfillment_status?: Database["public"]["Enums"]["fulfillment_status"]
          id?: string
          idempotency_key?: string | null
          is_draft?: boolean
          metadata?: Json
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          region_id?: string | null
          shipping_address?: Json
          shipping_total?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax_total?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency_code: string
          id: string
          order_id: string | null
          provider: string
          raw_response: Json | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount: number
          created_at?: string
          currency_code?: string
          id?: string
          order_id?: string | null
          provider?: string
          raw_response?: Json | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount?: number
          created_at?: string
          currency_code?: string
          id?: string
          order_id?: string | null
          provider?: string
          raw_response?: Json | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      prices: {
        Row: {
          amount: number
          compare_at_amount: number | null
          created_at: string
          currency_code: string
          id: string
          variant_id: string
        }
        Insert: {
          amount: number
          compare_at_amount?: number | null
          created_at?: string
          currency_code?: string
          id?: string
          variant_id: string
        }
        Update: {
          amount?: number
          compare_at_amount?: number | null
          created_at?: string
          currency_code?: string
          id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prices_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          category_id: string
          product_id: string
        }
        Insert: {
          category_id: string
          product_id: string
        }
        Update: {
          category_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          rank: number
          url: string
        }
        Insert: {
          id?: string
          product_id: string
          rank?: number
          url: string
        }
        Update: {
          id?: string
          product_id?: string
          rank?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_option_values: {
        Row: {
          id: string
          option_id: string
          value: string
        }
        Insert: {
          id?: string
          option_id: string
          value: string
        }
        Update: {
          id?: string
          option_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_option_values_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "product_options"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          id: string
          product_id: string
          title: string
        }
        Insert: {
          id?: string
          product_id: string
          title: string
        }
        Update: {
          id?: string
          product_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          barcode: string | null
          created_at: string
          id: string
          metadata: Json
          product_id: string
          sku: string | null
          title: string
          weight_grams: number
        }
        Insert: {
          barcode?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          product_id: string
          sku?: string | null
          title: string
          weight_grams?: number
        }
        Update: {
          barcode?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          product_id?: string
          sku?: string | null
          title?: string
          weight_grams?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          care: string | null
          collection_id: string | null
          created_at: string
          description: string | null
          fit: string | null
          gsm: number | null
          handle: string
          hsn_code: string | null
          id: string
          material: string | null
          metadata: Json
          search_vector: unknown
          size_chart_url: string | null
          status: string
          tax_category: string
          thumbnail: string | null
          title: string
          updated_at: string
        }
        Insert: {
          care?: string | null
          collection_id?: string | null
          created_at?: string
          description?: string | null
          fit?: string | null
          gsm?: number | null
          handle: string
          hsn_code?: string | null
          id?: string
          material?: string | null
          metadata?: Json
          search_vector?: unknown
          size_chart_url?: string | null
          status?: string
          tax_category?: string
          thumbnail?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          care?: string | null
          collection_id?: string | null
          created_at?: string
          description?: string | null
          fit?: string | null
          gsm?: number | null
          handle?: string
          hsn_code?: string | null
          id?: string
          material?: string | null
          metadata?: Json
          search_vector?: unknown
          size_chart_url?: string | null
          status?: string
          tax_category?: string
          thumbnail?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          code: string
          ends_at: string | null
          id: string
          is_active: boolean
          max_redemptions: number | null
          min_subtotal: number
          redemptions_count: number
          starts_at: string | null
          type: Database["public"]["Enums"]["discount_type"]
          value: number
        }
        Insert: {
          code: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_redemptions?: number | null
          min_subtotal?: number
          redemptions_count?: number
          starts_at?: string | null
          type: Database["public"]["Enums"]["discount_type"]
          value: number
        }
        Update: {
          code?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_redemptions?: number | null
          min_subtotal?: number
          redemptions_count?: number
          starts_at?: string | null
          type?: Database["public"]["Enums"]["discount_type"]
          value?: number
        }
        Relationships: []
      }
      refunds: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string
          payment_id: string | null
          razorpay_refund_id: string | null
          reason: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          order_id: string
          payment_id?: string | null
          razorpay_refund_id?: string | null
          reason?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string
          payment_id?: string | null
          razorpay_refund_id?: string | null
          reason?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          created_at: string
          currency_code: string
          id: string
          name: string
          tax_inclusive: boolean
        }
        Insert: {
          created_at?: string
          currency_code?: string
          id?: string
          name: string
          tax_inclusive?: boolean
        }
        Update: {
          created_at?: string
          currency_code?: string
          id?: string
          name?: string
          tax_inclusive?: boolean
        }
        Relationships: []
      }
      reservations: {
        Row: {
          cart_id: string | null
          created_at: string
          expires_at: string
          id: string
          inventory_item_id: string
          location_id: string
          order_id: string | null
          quantity: number
        }
        Insert: {
          cart_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          inventory_item_id: string
          location_id: string
          order_id?: string | null
          quantity: number
        }
        Update: {
          cart_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          inventory_item_id?: string
          location_id?: string
          order_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "reservations_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      return_items: {
        Row: {
          exchange_variant_id: string | null
          id: string
          is_exchange: boolean
          order_item_id: string | null
          quantity: number
          return_id: string
        }
        Insert: {
          exchange_variant_id?: string | null
          id?: string
          is_exchange?: boolean
          order_item_id?: string | null
          quantity: number
          return_id: string
        }
        Update: {
          exchange_variant_id?: string | null
          id?: string
          is_exchange?: boolean
          order_item_id?: string | null
          quantity?: number
          return_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "return_items_exchange_variant_id_fkey"
            columns: ["exchange_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_items_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_items_return_id_fkey"
            columns: ["return_id"]
            isOneToOne: false
            referencedRelation: "returns"
            referencedColumns: ["id"]
          },
        ]
      }
      returns: {
        Row: {
          awb_code: string | null
          created_at: string
          id: string
          order_id: string
          reason: string | null
          refund_amount: number | null
          shiprocket_return_id: string | null
          status: Database["public"]["Enums"]["return_status"]
        }
        Insert: {
          awb_code?: string | null
          created_at?: string
          id?: string
          order_id: string
          reason?: string | null
          refund_amount?: number | null
          shiprocket_return_id?: string | null
          status?: Database["public"]["Enums"]["return_status"]
        }
        Update: {
          awb_code?: string | null
          created_at?: string
          id?: string
          order_id?: string
          reason?: string | null
          refund_amount?: number | null
          shiprocket_return_id?: string | null
          status?: Database["public"]["Enums"]["return_status"]
        }
        Relationships: [
          {
            foreignKeyName: "returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string
          customer_id: string | null
          id: string
          is_approved: boolean
          order_id: string | null
          product_id: string
          rating: number
          title: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          is_approved?: boolean
          order_id?: string | null
          product_id: string
          rating: number
          title?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          is_approved?: boolean
          order_id?: string | null
          product_id?: string
          rating?: number
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      schema_migrations: {
        Row: {
          applied_at: string
          name: string
        }
        Insert: {
          applied_at?: string
          name: string
        }
        Update: {
          applied_at?: string
          name?: string
        }
        Relationships: []
      }
      shared_chats: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          messages: Json
          session_id: string
          share_key: string
          title: string | null
          view_count: number | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          messages: Json
          session_id: string
          share_key: string
          title?: string | null
          view_count?: number | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          messages?: Json
          session_id?: string
          share_key?: string
          title?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_chats_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          awb_code: string | null
          courier_name: string | null
          created_at: string
          id: string
          label_url: string | null
          order_id: string
          shiprocket_order_id: string | null
          shiprocket_shipment_id: string | null
          status: Database["public"]["Enums"]["fulfillment_status"]
          tracking_url: string | null
        }
        Insert: {
          awb_code?: string | null
          courier_name?: string | null
          created_at?: string
          id?: string
          label_url?: string | null
          order_id: string
          shiprocket_order_id?: string | null
          shiprocket_shipment_id?: string | null
          status?: Database["public"]["Enums"]["fulfillment_status"]
          tracking_url?: string | null
        }
        Update: {
          awb_code?: string | null
          courier_name?: string | null
          created_at?: string
          id?: string
          label_url?: string | null
          order_id?: string
          shiprocket_order_id?: string | null
          shiprocket_shipment_id?: string | null
          status?: Database["public"]["Enums"]["fulfillment_status"]
          tracking_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_options: {
        Row: {
          amount: number
          id: string
          name: string
          provider: string
          region_id: string | null
        }
        Insert: {
          amount?: number
          id?: string
          name: string
          provider?: string
          region_id?: string | null
        }
        Update: {
          amount?: number
          id?: string
          name?: string
          provider?: string
          region_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipping_options_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      stock_notifications: {
        Row: {
          created_at: string
          email: string
          id: string
          notified: boolean
          variant_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notified?: boolean
          variant_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notified?: boolean
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_notifications_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          status: string | null
          title: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          status?: string | null
          title: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          status?: string | null
          title?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_rates: {
        Row: {
          applies_to: string
          id: string
          name: string
          rate: number
          region_id: string | null
        }
        Insert: {
          applies_to?: string
          id?: string
          name: string
          rate: number
          region_id?: string | null
        }
        Update: {
          applies_to?: string
          id?: string
          name?: string
          rate?: number
          region_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tax_rates_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_calls: {
        Row: {
          arguments: Json | null
          created_at: string
          id: string
          result: Json | null
          session_id: string | null
          status: string
          tool_name: string
          workspace_id: string
        }
        Insert: {
          arguments?: Json | null
          created_at?: string
          id?: string
          result?: Json | null
          session_id?: string | null
          status: string
          tool_name: string
          workspace_id: string
        }
        Update: {
          arguments?: Json | null
          created_at?: string
          id?: string
          result?: Json | null
          session_id?: string | null
          status?: string
          tool_name?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_calls_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_calls_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      variant_option_values: {
        Row: {
          option_value_id: string
          variant_id: string
        }
        Insert: {
          option_value_id: string
          variant_id: string
        }
        Update: {
          option_value_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "variant_option_values_option_value_id_fkey"
            columns: ["option_value_id"]
            isOneToOne: false
            referencedRelation: "product_option_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variant_option_values_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          created_at: string
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
          provider: string
        }
        Insert: {
          created_at?: string
          event_id: string
          event_type: string
          id?: string
          payload: Json
          processed_at?: string | null
          provider: string
        }
        Update: {
          created_at?: string
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          provider?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          customer_id: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          variant_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      confirm_order_stock: { Args: { p_order: string }; Returns: undefined }
      is_admin: { Args: { uid: string }; Returns: boolean }
      match_chunks: {
        Args: {
          match_count: number
          match_threshold: number
          p_workspace_id: string
          query_embedding: string
        }
        Returns: {
          content: string
          document_id: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      match_chunks_hybrid: {
        Args: {
          keyword_weight?: number
          match_count?: number
          match_threshold?: number
          p_workspace_id: string
          query_embedding: string
          query_text: string
          rrf_k?: number
        }
        Returns: {
          combined_score: number
          content: string
          document_id: string
          id: string
          keyword_rank: number
          metadata: Json
          similarity: number
        }[]
      }
      release_cart_reservations: {
        Args: { p_cart: string }
        Returns: undefined
      }
      release_expired_reservations: { Args: never; Returns: undefined }
      release_order_stock: { Args: { p_order: string }; Returns: undefined }
      reserve_stock: {
        Args: { p_cart: string; p_qty: number; p_variant: string }
        Returns: undefined
      }
      search_chunks_keyword: {
        Args: {
          match_count?: number
          p_workspace_id: string
          query_text: string
        }
        Returns: {
          content: string
          document_id: string
          id: string
          metadata: Json
          rank: number
        }[]
      }
    }
    Enums: {
      discount_type: "percentage" | "fixed"
      fulfillment_status:
        | "not_fulfilled"
        | "partially_fulfilled"
        | "fulfilled"
        | "shipped"
        | "delivered"
        | "returned"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "returned"
      payment_status:
        | "pending"
        | "authorized"
        | "paid"
        | "failed"
        | "refunded"
        | "partially_refunded"
      return_status:
        | "requested"
        | "approved"
        | "picked_up"
        | "received"
        | "refunded"
        | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      discount_type: ["percentage", "fixed"],
      fulfillment_status: [
        "not_fulfilled",
        "partially_fulfilled",
        "fulfilled",
        "shipped",
        "delivered",
        "returned",
      ],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      payment_status: [
        "pending",
        "authorized",
        "paid",
        "failed",
        "refunded",
        "partially_refunded",
      ],
      return_status: [
        "requested",
        "approved",
        "picked_up",
        "received",
        "refunded",
        "rejected",
      ],
    },
  },
} as const
