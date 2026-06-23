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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      b2b_rates: {
        Row: {
          created_at: string | null
          id: string
          rate_per_kg: number
          user_id: string
          weight_max: number
          weight_min: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          rate_per_kg: number
          user_id: string
          weight_max: number
          weight_min: number
        }
        Update: {
          created_at?: string | null
          id?: string
          rate_per_kg?: number
          user_id?: string
          weight_max?: number
          weight_min?: number
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_purchase_amount: number | null
          updated_at: string
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_purchase_amount?: number | null
          updated_at?: string
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_purchase_amount?: number | null
          updated_at?: string
          used_count?: number | null
        }
        Relationships: []
      }
      dispute_history: {
        Row: {
          action: string
          created_at: string | null
          created_by: string
          dispute_id: string
          id: string
          new_status: string | null
          notes: string | null
          old_status: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          created_by: string
          dispute_id: string
          id?: string
          new_status?: string | null
          notes?: string | null
          old_status?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          created_by?: string
          dispute_id?: string
          id?: string
          new_status?: string | null
          notes?: string | null
          old_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispute_history_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          created_at: string | null
          created_by: string
          description: string
          dispute_type: string
          id: string
          package_id: string
          priority: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description: string
          dispute_type: string
          id?: string
          package_id: string
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string
          dispute_type?: string
          id?: string
          package_id?: string
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_stores: {
        Row: {
          category: string
          created_at: string | null
          id: string
          store_domain: string
          store_name: string
          store_url: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          store_domain: string
          store_name: string
          store_url: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          store_domain?: string
          store_name?: string
          store_url?: string
          user_id?: string
        }
        Relationships: []
      }
      kyc_documents: {
        Row: {
          created_at: string | null
          document_type: string
          document_url: string
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string | null
          user_id: string
          user_role: string
        }
        Insert: {
          created_at?: string | null
          document_type: string
          document_url: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          user_role: string
        }
        Update: {
          created_at?: string | null
          document_type?: string
          document_url?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          user_role?: string
        }
        Relationships: []
      }
      loyalty_points: {
        Row: {
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          order_id: string | null
          points_balance: number
          points_earned: number
          points_spent: number
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          order_id?: string | null
          points_balance?: number
          points_earned?: number
          points_spent?: number
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          order_id?: string | null
          points_balance?: number
          points_earned?: number
          points_spent?: number
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_points_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          preferences: Json | null
          subscribed_at: string
        }
        Insert: {
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          preferences?: Json | null
          subscribed_at?: string
        }
        Update: {
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          preferences?: Json | null
          subscribed_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          package_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          package_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          package_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
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
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_phone: string | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string
          shipping_address: string
          shipping_city: string
          shipping_country: string
          status: string
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string
          shipping_address: string
          shipping_city: string
          shipping_country?: string
          status?: string
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string
          shipping_address?: string
          shipping_city?: string
          shipping_country?: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      package_files: {
        Row: {
          created_at: string | null
          description: string | null
          file_type: string
          file_url: string
          id: string
          package_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_type: string
          file_url: string
          id?: string
          package_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_type?: string
          file_url?: string
          id?: string
          package_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "package_files_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      package_timeline: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          package_id: string
          status: Database["public"]["Enums"]["package_status"]
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          package_id: string
          status: Database["public"]["Enums"]["package_status"]
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          package_id?: string
          status?: Database["public"]["Enums"]["package_status"]
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "package_timeline_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          actual_weight: number | null
          consolidation_group: string | null
          created_at: string | null
          current_status: Database["public"]["Enums"]["package_status"] | null
          customs_cost: number | null
          delivery_cost: number | null
          delivery_type: string | null
          dimensions: string | null
          estimated_value: number | null
          estimated_weight: number | null
          external_tracking: string | null
          final_cost: number | null
          id: string
          international_tracking: string | null
          is_consolidated: boolean | null
          notes: string | null
          store_name: string
          tracking_number: string
          updated_at: string | null
          user_id: string
          volumetric_weight: number | null
          weight_cost: number | null
        }
        Insert: {
          actual_weight?: number | null
          consolidation_group?: string | null
          created_at?: string | null
          current_status?: Database["public"]["Enums"]["package_status"] | null
          customs_cost?: number | null
          delivery_cost?: number | null
          delivery_type?: string | null
          dimensions?: string | null
          estimated_value?: number | null
          estimated_weight?: number | null
          external_tracking?: string | null
          final_cost?: number | null
          id?: string
          international_tracking?: string | null
          is_consolidated?: boolean | null
          notes?: string | null
          store_name: string
          tracking_number: string
          updated_at?: string | null
          user_id: string
          volumetric_weight?: number | null
          weight_cost?: number | null
        }
        Update: {
          actual_weight?: number | null
          consolidation_group?: string | null
          created_at?: string | null
          current_status?: Database["public"]["Enums"]["package_status"] | null
          customs_cost?: number | null
          delivery_cost?: number | null
          delivery_type?: string | null
          dimensions?: string | null
          estimated_value?: number | null
          estimated_weight?: number | null
          external_tracking?: string | null
          final_cost?: number | null
          id?: string
          international_tracking?: string | null
          is_consolidated?: boolean | null
          notes?: string | null
          store_name?: string
          tracking_number?: string
          updated_at?: string | null
          user_id?: string
          volumetric_weight?: number | null
          weight_cost?: number | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          package_id: string
          paid_at: string | null
          payment_method: string | null
          payment_status: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          package_id: string
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          package_id?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: string | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      payments_webhooks: {
        Row: {
          amount: number
          charge_id: string
          created_at: string | null
          event_type: string
          id: string
          raw: Json
          status: string
        }
        Insert: {
          amount: number
          charge_id: string
          created_at?: string | null
          event_type: string
          id?: string
          raw: Json
          status: string
        }
        Update: {
          amount?: number
          charge_id?: string
          created_at?: string | null
          event_type?: string
          id?: string
          raw?: Json
          status?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_primary: boolean
          product_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_primary?: boolean
          product_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_primary?: boolean
          product_id?: string
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
      product_variants: {
        Row: {
          created_at: string
          id: string
          is_available: boolean | null
          price_modifier: number | null
          product_id: string
          sku: string | null
          stock: number
          updated_at: string
          variant_type: string
          variant_value: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_available?: boolean | null
          price_modifier?: number | null
          product_id: string
          sku?: string | null
          stock?: number
          updated_at?: string
          variant_type: string
          variant_value: string
        }
        Update: {
          created_at?: string
          id?: string
          is_available?: boolean | null
          price_modifier?: number | null
          product_id?: string
          sku?: string | null
          stock?: number
          updated_at?: string
          variant_type?: string
          variant_value?: string
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
          category_id: string | null
          created_at: string
          description: string | null
          featured: boolean
          id: string
          is_active: boolean
          name: string
          price: number
          sku: string | null
          stock: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          is_active?: boolean
          name: string
          price: number
          sku?: string | null
          stock?: number
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          sku?: string | null
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          affidavit_signature_url: string | null
          affidavit_signed: boolean | null
          affidavit_signed_at: string | null
          apellido_materno: string | null
          apellido_paterno: string | null
          avatar_url: string | null
          b2b_discount: number | null
          city: string | null
          country: string | null
          created_at: string | null
          document_number: string | null
          document_type: string | null
          document_verified: boolean
          document_verified_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean
          nombres: string | null
          person_type: string
          phone: string | null
          razon_social: string | null
          shopper_verified: boolean | null
          shopper_verified_at: string | null
          shopper_verified_by: string | null
          traveler_verified: boolean | null
          traveler_verified_at: string | null
          traveler_verified_by: string | null
          updated_at: string | null
          vip_points_lifetime: number | null
          vip_tier: string | null
          vip_updated_at: string | null
          warehouse_code: string | null
        }
        Insert: {
          address?: string | null
          affidavit_signature_url?: string | null
          affidavit_signed?: boolean | null
          affidavit_signed_at?: string | null
          apellido_materno?: string | null
          apellido_paterno?: string | null
          avatar_url?: string | null
          b2b_discount?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          document_number?: string | null
          document_type?: string | null
          document_verified?: boolean
          document_verified_at?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean
          nombres?: string | null
          person_type?: string
          phone?: string | null
          razon_social?: string | null
          shopper_verified?: boolean | null
          shopper_verified_at?: string | null
          shopper_verified_by?: string | null
          traveler_verified?: boolean | null
          traveler_verified_at?: string | null
          traveler_verified_by?: string | null
          updated_at?: string | null
          vip_points_lifetime?: number | null
          vip_tier?: string | null
          vip_updated_at?: string | null
          warehouse_code?: string | null
        }
        Update: {
          address?: string | null
          affidavit_signature_url?: string | null
          affidavit_signed?: boolean | null
          affidavit_signed_at?: string | null
          apellido_materno?: string | null
          apellido_paterno?: string | null
          avatar_url?: string | null
          b2b_discount?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          document_number?: string | null
          document_type?: string | null
          document_verified?: boolean
          document_verified_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          nombres?: string | null
          person_type?: string
          phone?: string | null
          razon_social?: string | null
          shopper_verified?: boolean | null
          shopper_verified_at?: string | null
          shopper_verified_by?: string | null
          traveler_verified?: boolean | null
          traveler_verified_at?: string | null
          traveler_verified_by?: string | null
          updated_at?: string | null
          vip_points_lifetime?: number | null
          vip_tier?: string | null
          vip_updated_at?: string | null
          warehouse_code?: string | null
        }
        Relationships: []
      }
      ps_client_approvals: {
        Row: {
          aprobado: boolean
          aprobado_at: string | null
          cliente_id: string
          created_at: string | null
          descripcion: string | null
          detalle_cambio: Json | null
          id: string
          ip_address: string | null
          monto_nuevo: number | null
          monto_original: number | null
          order_id: string
          tipo_aprobacion: string
          user_agent: string | null
        }
        Insert: {
          aprobado?: boolean
          aprobado_at?: string | null
          cliente_id: string
          created_at?: string | null
          descripcion?: string | null
          detalle_cambio?: Json | null
          id?: string
          ip_address?: string | null
          monto_nuevo?: number | null
          monto_original?: number | null
          order_id: string
          tipo_aprobacion: string
          user_agent?: string | null
        }
        Update: {
          aprobado?: boolean
          aprobado_at?: string | null
          cliente_id?: string
          created_at?: string | null
          descripcion?: string | null
          detalle_cambio?: Json | null
          id?: string
          ip_address?: string | null
          monto_nuevo?: number | null
          monto_original?: number | null
          order_id?: string
          tipo_aprobacion?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ps_client_approvals_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "ps_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      ps_decision_log: {
        Row: {
          actor_id: string
          actor_tipo: string
          approved: boolean | null
          approved_at: string | null
          contexto: Json | null
          created_at: string | null
          descripcion: string
          id: string
          order_id: string
          requires_approval: boolean | null
          tipo_decision: string
        }
        Insert: {
          actor_id: string
          actor_tipo: string
          approved?: boolean | null
          approved_at?: string | null
          contexto?: Json | null
          created_at?: string | null
          descripcion: string
          id?: string
          order_id: string
          requires_approval?: boolean | null
          tipo_decision: string
        }
        Update: {
          actor_id?: string
          actor_tipo?: string
          approved?: boolean | null
          approved_at?: string | null
          contexto?: Json | null
          created_at?: string | null
          descripcion?: string
          id?: string
          order_id?: string
          requires_approval?: boolean | null
          tipo_decision?: string
        }
        Relationships: [
          {
            foreignKeyName: "ps_decision_log_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "ps_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      ps_incidents: {
        Row: {
          created_at: string
          descripcion: string
          estado: string
          evidencia_urls: string[] | null
          id: string
          order_id: string
          reportado_por: string
          resolucion: string | null
          resolved_at: string | null
          resuelto_por: string | null
          tipo: string
        }
        Insert: {
          created_at?: string
          descripcion: string
          estado?: string
          evidencia_urls?: string[] | null
          id?: string
          order_id: string
          reportado_por: string
          resolucion?: string | null
          resolved_at?: string | null
          resuelto_por?: string | null
          tipo: string
        }
        Update: {
          created_at?: string
          descripcion?: string
          estado?: string
          evidencia_urls?: string[] | null
          id?: string
          order_id?: string
          reportado_por?: string
          resolucion?: string | null
          resolved_at?: string | null
          resuelto_por?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "ps_incidents_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "ps_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      ps_live_events: {
        Row: {
          actor_id: string
          actor_tipo: string
          created_at: string | null
          descripcion: string
          id: string
          metadata: Json | null
          session_id: string
          tipo: string
        }
        Insert: {
          actor_id: string
          actor_tipo: string
          created_at?: string | null
          descripcion: string
          id?: string
          metadata?: Json | null
          session_id: string
          tipo: string
        }
        Update: {
          actor_id?: string
          actor_tipo?: string
          created_at?: string | null
          descripcion?: string
          id?: string
          metadata?: Json | null
          session_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "ps_live_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ps_live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ps_live_incidents: {
        Row: {
          alternativa_ofrecida: string | null
          cliente_decision: string | null
          cliente_decision_at: string | null
          created_at: string | null
          descripcion: string
          id: string
          producto_afectado: string | null
          reportado_por: string
          resolucion: string | null
          resolved_at: string | null
          session_id: string
          tipo: string
        }
        Insert: {
          alternativa_ofrecida?: string | null
          cliente_decision?: string | null
          cliente_decision_at?: string | null
          created_at?: string | null
          descripcion: string
          id?: string
          producto_afectado?: string | null
          reportado_por: string
          resolucion?: string | null
          resolved_at?: string | null
          session_id: string
          tipo: string
        }
        Update: {
          alternativa_ofrecida?: string | null
          cliente_decision?: string | null
          cliente_decision_at?: string | null
          created_at?: string | null
          descripcion?: string
          id?: string
          producto_afectado?: string | null
          reportado_por?: string
          resolucion?: string | null
          resolved_at?: string | null
          session_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "ps_live_incidents_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ps_live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ps_live_orders: {
        Row: {
          approved_at: string | null
          budget_exhausted: boolean | null
          budget_exhausted_at: string | null
          categorias_permitidas: string[]
          cliente_id: string
          completed_at: string | null
          created_at: string | null
          duracion_max_sesion: number
          estado: Database["public"]["Enums"]["ps_live_order_status"]
          fecha_preferida: string | null
          hora_preferida_peru: string | null
          id: string
          limite_items: number
          metodo_pago: Database["public"]["Enums"]["ps_live_payment_method"]
          moneda: string
          personal_shopper_id: string | null
          presupuesto_gastado: number | null
          presupuesto_maximo: number
          regla_silencio_accion: Database["public"]["Enums"]["ps_live_silence_rule"]
          regla_silencio_segundos: number
          terminos_aceptados: boolean | null
          terminos_aceptados_at: string | null
          tiendas_objetivo: string[] | null
          tipo_aprobacion: Database["public"]["Enums"]["ps_live_approval_type"]
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          budget_exhausted?: boolean | null
          budget_exhausted_at?: string | null
          categorias_permitidas: string[]
          cliente_id: string
          completed_at?: string | null
          created_at?: string | null
          duracion_max_sesion?: number
          estado?: Database["public"]["Enums"]["ps_live_order_status"]
          fecha_preferida?: string | null
          hora_preferida_peru?: string | null
          id?: string
          limite_items?: number
          metodo_pago?: Database["public"]["Enums"]["ps_live_payment_method"]
          moneda?: string
          personal_shopper_id?: string | null
          presupuesto_gastado?: number | null
          presupuesto_maximo: number
          regla_silencio_accion?: Database["public"]["Enums"]["ps_live_silence_rule"]
          regla_silencio_segundos?: number
          terminos_aceptados?: boolean | null
          terminos_aceptados_at?: string | null
          tiendas_objetivo?: string[] | null
          tipo_aprobacion?: Database["public"]["Enums"]["ps_live_approval_type"]
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          budget_exhausted?: boolean | null
          budget_exhausted_at?: string | null
          categorias_permitidas?: string[]
          cliente_id?: string
          completed_at?: string | null
          created_at?: string | null
          duracion_max_sesion?: number
          estado?: Database["public"]["Enums"]["ps_live_order_status"]
          fecha_preferida?: string | null
          hora_preferida_peru?: string | null
          id?: string
          limite_items?: number
          metodo_pago?: Database["public"]["Enums"]["ps_live_payment_method"]
          moneda?: string
          personal_shopper_id?: string | null
          presupuesto_gastado?: number | null
          presupuesto_maximo?: number
          regla_silencio_accion?: Database["public"]["Enums"]["ps_live_silence_rule"]
          regla_silencio_segundos?: number
          terminos_aceptados?: boolean | null
          terminos_aceptados_at?: string | null
          tiendas_objetivo?: string[] | null
          tipo_aprobacion?: Database["public"]["Enums"]["ps_live_approval_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      ps_live_proposals: {
        Row: {
          categoria: string
          created_at: string | null
          descripcion: string | null
          id: string
          imagen_url: string | null
          live_order_id: string
          motivo_rechazo: string | null
          nombre_producto: string
          precio: number
          presupuesto_disponible_al_proponer: number
          respuesta: Database["public"]["Enums"]["ps_live_proposal_response"]
          respuesta_at: string | null
          session_id: string
          silencio_aplicado: boolean | null
          silencio_aplicado_at: string | null
          tienda: string
        }
        Insert: {
          categoria: string
          created_at?: string | null
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          live_order_id: string
          motivo_rechazo?: string | null
          nombre_producto: string
          precio: number
          presupuesto_disponible_al_proponer: number
          respuesta?: Database["public"]["Enums"]["ps_live_proposal_response"]
          respuesta_at?: string | null
          session_id: string
          silencio_aplicado?: boolean | null
          silencio_aplicado_at?: string | null
          tienda: string
        }
        Update: {
          categoria?: string
          created_at?: string | null
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          live_order_id?: string
          motivo_rechazo?: string | null
          nombre_producto?: string
          precio?: number
          presupuesto_disponible_al_proponer?: number
          respuesta?: Database["public"]["Enums"]["ps_live_proposal_response"]
          respuesta_at?: string | null
          session_id?: string
          silencio_aplicado?: boolean | null
          silencio_aplicado_at?: string | null
          tienda?: string
        }
        Relationships: [
          {
            foreignKeyName: "ps_live_proposals_live_order_id_fkey"
            columns: ["live_order_id"]
            isOneToOne: false
            referencedRelation: "ps_live_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ps_live_proposals_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ps_live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ps_live_sessions: {
        Row: {
          categoria: Database["public"]["Enums"]["ps_category"]
          ciudad: string | null
          created_at: string
          descripcion: string | null
          duracion_estimada: number | null
          ended_at: string | null
          estado: Database["public"]["Enums"]["ps_live_status"]
          fecha: string
          hora_peru: string
          hora_usa: string
          id: string
          live_order_id: string | null
          lock_reason: string | null
          locked_at: string | null
          locked_by: string | null
          max_viewers: number | null
          personal_shopper_id: string
          started_at: string | null
          tienda: string
          titulo: string
          total_ventas: number | null
          ubicacion: string
        }
        Insert: {
          categoria: Database["public"]["Enums"]["ps_category"]
          ciudad?: string | null
          created_at?: string
          descripcion?: string | null
          duracion_estimada?: number | null
          ended_at?: string | null
          estado?: Database["public"]["Enums"]["ps_live_status"]
          fecha: string
          hora_peru: string
          hora_usa: string
          id?: string
          live_order_id?: string | null
          lock_reason?: string | null
          locked_at?: string | null
          locked_by?: string | null
          max_viewers?: number | null
          personal_shopper_id: string
          started_at?: string | null
          tienda: string
          titulo: string
          total_ventas?: number | null
          ubicacion: string
        }
        Update: {
          categoria?: Database["public"]["Enums"]["ps_category"]
          ciudad?: string | null
          created_at?: string
          descripcion?: string | null
          duracion_estimada?: number | null
          ended_at?: string | null
          estado?: Database["public"]["Enums"]["ps_live_status"]
          fecha?: string
          hora_peru?: string
          hora_usa?: string
          id?: string
          live_order_id?: string | null
          lock_reason?: string | null
          locked_at?: string | null
          locked_by?: string | null
          max_viewers?: number | null
          personal_shopper_id?: string
          started_at?: string | null
          tienda?: string
          titulo?: string
          total_ventas?: number | null
          ubicacion?: string
        }
        Relationships: [
          {
            foreignKeyName: "ps_live_sessions_live_order_id_fkey"
            columns: ["live_order_id"]
            isOneToOne: false
            referencedRelation: "ps_live_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      ps_messages: {
        Row: {
          created_at: string
          emisor_id: string
          id: string
          imagen_url: string | null
          leido: boolean | null
          leido_at: string | null
          mensaje: string
          order_id: string
          tipo: Database["public"]["Enums"]["ps_message_type"]
        }
        Insert: {
          created_at?: string
          emisor_id: string
          id?: string
          imagen_url?: string | null
          leido?: boolean | null
          leido_at?: string | null
          mensaje: string
          order_id: string
          tipo?: Database["public"]["Enums"]["ps_message_type"]
        }
        Update: {
          created_at?: string
          emisor_id?: string
          id?: string
          imagen_url?: string | null
          leido?: boolean | null
          leido_at?: string | null
          mensaje?: string
          order_id?: string
          tipo?: Database["public"]["Enums"]["ps_message_type"]
        }
        Relationships: [
          {
            foreignKeyName: "ps_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "ps_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      ps_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          mensaje: string
          metadata: Json | null
          order_id: string | null
          quote_id: string | null
          request_id: string | null
          tipo: string
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          mensaje: string
          metadata?: Json | null
          order_id?: string | null
          quote_id?: string | null
          request_id?: string | null
          tipo: string
          titulo: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          mensaje?: string
          metadata?: Json | null
          order_id?: string | null
          quote_id?: string | null
          request_id?: string | null
          tipo?: string
          titulo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ps_notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "ps_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ps_notifications_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "ps_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ps_notifications_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "ps_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      ps_order_status_history: {
        Row: {
          actualizado_por: string | null
          comentario: string | null
          created_at: string
          es_automatico: boolean | null
          estado: Database["public"]["Enums"]["ps_order_status"]
          estado_anterior: Database["public"]["Enums"]["ps_order_status"] | null
          id: string
          order_id: string
        }
        Insert: {
          actualizado_por?: string | null
          comentario?: string | null
          created_at?: string
          es_automatico?: boolean | null
          estado: Database["public"]["Enums"]["ps_order_status"]
          estado_anterior?:
            | Database["public"]["Enums"]["ps_order_status"]
            | null
          id?: string
          order_id: string
        }
        Update: {
          actualizado_por?: string | null
          comentario?: string | null
          created_at?: string
          es_automatico?: boolean | null
          estado?: Database["public"]["Enums"]["ps_order_status"]
          estado_anterior?:
            | Database["public"]["Enums"]["ps_order_status"]
            | null
          id?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ps_order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "ps_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      ps_orders: {
        Row: {
          blocked_reason: string | null
          cliente_id: string
          closed_at: string | null
          comision_boxifly: number
          comision_ps: number | null
          costo_envio_usa: number | null
          costo_servicio: number
          created_at: string
          estado: Database["public"]["Enums"]["ps_order_status"]
          fecha_compra: string | null
          fecha_entrega: string | null
          fecha_envio_peru: string | null
          fecha_recepcion_usa: string | null
          id: string
          last_client_action_at: string | null
          monto_producto: number
          personal_shopper_id: string
          request_id: string
          requires_client_approval: boolean | null
          total_cliente: number
          tracking_internacional: string | null
          tracking_usa: string | null
          updated_at: string
        }
        Insert: {
          blocked_reason?: string | null
          cliente_id: string
          closed_at?: string | null
          comision_boxifly?: number
          comision_ps?: number | null
          costo_envio_usa?: number | null
          costo_servicio?: number
          created_at?: string
          estado?: Database["public"]["Enums"]["ps_order_status"]
          fecha_compra?: string | null
          fecha_entrega?: string | null
          fecha_envio_peru?: string | null
          fecha_recepcion_usa?: string | null
          id?: string
          last_client_action_at?: string | null
          monto_producto: number
          personal_shopper_id: string
          request_id: string
          requires_client_approval?: boolean | null
          total_cliente: number
          tracking_internacional?: string | null
          tracking_usa?: string | null
          updated_at?: string
        }
        Update: {
          blocked_reason?: string | null
          cliente_id?: string
          closed_at?: string | null
          comision_boxifly?: number
          comision_ps?: number | null
          costo_envio_usa?: number | null
          costo_servicio?: number
          created_at?: string
          estado?: Database["public"]["Enums"]["ps_order_status"]
          fecha_compra?: string | null
          fecha_entrega?: string | null
          fecha_envio_peru?: string | null
          fecha_recepcion_usa?: string | null
          id?: string
          last_client_action_at?: string | null
          monto_producto?: number
          personal_shopper_id?: string
          request_id?: string
          requires_client_approval?: boolean | null
          total_cliente?: number
          tracking_internacional?: string | null
          tracking_usa?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ps_orders_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "ps_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      ps_payments: {
        Row: {
          cliente_id: string
          created_at: string
          estado: Database["public"]["Enums"]["ps_payment_status"]
          gateway_response: Json | null
          id: string
          metodo_pago: string | null
          moneda: string | null
          monto: number
          order_id: string
          paid_at: string | null
          referencia_externa: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string
          estado?: Database["public"]["Enums"]["ps_payment_status"]
          gateway_response?: Json | null
          id?: string
          metodo_pago?: string | null
          moneda?: string | null
          monto: number
          order_id: string
          paid_at?: string | null
          referencia_externa?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string
          estado?: Database["public"]["Enums"]["ps_payment_status"]
          gateway_response?: Json | null
          id?: string
          metodo_pago?: string | null
          moneda?: string | null
          monto?: number
          order_id?: string
          paid_at?: string | null
          referencia_externa?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ps_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "ps_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      ps_quotes: {
        Row: {
          costo_servicio: number
          created_at: string
          descripcion: string | null
          es_seleccionada: boolean | null
          estado: Database["public"]["Enums"]["ps_quote_status"]
          expires_at: string | null
          id: string
          imagen_url: string | null
          impuestos_estimados: number | null
          nombre_producto: string
          notas_ps: string | null
          personal_shopper_id: string
          precio_producto: number
          razon_rechazo: string | null
          request_id: string
          respondida_at: string | null
          total_estimado: number
          url_producto: string | null
        }
        Insert: {
          costo_servicio: number
          created_at?: string
          descripcion?: string | null
          es_seleccionada?: boolean | null
          estado?: Database["public"]["Enums"]["ps_quote_status"]
          expires_at?: string | null
          id?: string
          imagen_url?: string | null
          impuestos_estimados?: number | null
          nombre_producto: string
          notas_ps?: string | null
          personal_shopper_id: string
          precio_producto: number
          razon_rechazo?: string | null
          request_id: string
          respondida_at?: string | null
          total_estimado: number
          url_producto?: string | null
        }
        Update: {
          costo_servicio?: number
          created_at?: string
          descripcion?: string | null
          es_seleccionada?: boolean | null
          estado?: Database["public"]["Enums"]["ps_quote_status"]
          expires_at?: string | null
          id?: string
          imagen_url?: string | null
          impuestos_estimados?: number | null
          nombre_producto?: string
          notas_ps?: string | null
          personal_shopper_id?: string
          precio_producto?: number
          razon_rechazo?: string | null
          request_id?: string
          respondida_at?: string | null
          total_estimado?: number
          url_producto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ps_quotes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "ps_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      ps_requests: {
        Row: {
          categoria: Database["public"]["Enums"]["ps_category"]
          cliente_id: string
          created_at: string
          descripcion_producto: string
          especificaciones: Json | null
          estado: Database["public"]["Enums"]["ps_request_status"]
          id: string
          imagen_referencia: string | null
          motivo_rechazo: string | null
          notas_cliente: string | null
          presupuesto_max: number
          presupuesto_min: number | null
          prioridad: number | null
          tipo_servicio: Database["public"]["Enums"]["ps_service_type"]
          updated_at: string
          url_referencia: string | null
        }
        Insert: {
          categoria: Database["public"]["Enums"]["ps_category"]
          cliente_id: string
          created_at?: string
          descripcion_producto: string
          especificaciones?: Json | null
          estado?: Database["public"]["Enums"]["ps_request_status"]
          id?: string
          imagen_referencia?: string | null
          motivo_rechazo?: string | null
          notas_cliente?: string | null
          presupuesto_max: number
          presupuesto_min?: number | null
          prioridad?: number | null
          tipo_servicio?: Database["public"]["Enums"]["ps_service_type"]
          updated_at?: string
          url_referencia?: string | null
        }
        Update: {
          categoria?: Database["public"]["Enums"]["ps_category"]
          cliente_id?: string
          created_at?: string
          descripcion_producto?: string
          especificaciones?: Json | null
          estado?: Database["public"]["Enums"]["ps_request_status"]
          id?: string
          imagen_referencia?: string | null
          motivo_rechazo?: string | null
          notas_cliente?: string | null
          presupuesto_max?: number
          presupuesto_min?: number | null
          prioridad?: number | null
          tipo_servicio?: Database["public"]["Enums"]["ps_service_type"]
          updated_at?: string
          url_referencia?: string | null
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          user_id?: string
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          amount: number
          claimed_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          referral_id: string
          reward_type: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          claimed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          referral_id: string
          reward_type: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          claimed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          referral_id?: string
          reward_type?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      shopping_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          request_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          request_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          request_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "shopping_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_requests: {
        Row: {
          actual_cost: number | null
          approximate_price: number | null
          created_at: string
          customer_id: string
          id: string
          payment_status: string | null
          product_description: string | null
          product_name: string
          product_url: string | null
          purchased_at: string | null
          quantity: number
          shipped_at: string | null
          shopper_commission: number | null
          shopper_id: string | null
          special_notes: string | null
          status: string
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          approximate_price?: number | null
          created_at?: string
          customer_id: string
          id?: string
          payment_status?: string | null
          product_description?: string | null
          product_name: string
          product_url?: string | null
          purchased_at?: string | null
          quantity?: number
          shipped_at?: string | null
          shopper_commission?: number | null
          shopper_id?: string | null
          special_notes?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          approximate_price?: number | null
          created_at?: string
          customer_id?: string
          id?: string
          payment_status?: string | null
          product_description?: string | null
          product_name?: string
          product_url?: string | null
          purchased_at?: string | null
          quantity?: number
          shipped_at?: string | null
          shopper_commission?: number | null
          shopper_id?: string | null
          special_notes?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tariffs: {
        Row: {
          base_rate_per_kg: number
          created_at: string | null
          custom_charges: Json | null
          customs_handling_rates: Json | null
          customs_percentage: number | null
          delivery_fee: number | null
          guarantee_rates: Json | null
          id: string
          is_active: boolean | null
          name: string
          tax_threshold: number | null
          updated_at: string | null
          weight_rates: Json | null
        }
        Insert: {
          base_rate_per_kg: number
          created_at?: string | null
          custom_charges?: Json | null
          customs_handling_rates?: Json | null
          customs_percentage?: number | null
          delivery_fee?: number | null
          guarantee_rates?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          tax_threshold?: number | null
          updated_at?: string | null
          weight_rates?: Json | null
        }
        Update: {
          base_rate_per_kg?: number
          created_at?: string | null
          custom_charges?: Json | null
          customs_handling_rates?: Json | null
          customs_percentage?: number | null
          delivery_fee?: number | null
          guarantee_rates?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          tax_threshold?: number | null
          updated_at?: string | null
          weight_rates?: Json | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          comment: string
          created_at: string
          customer_name: string
          customer_role: string | null
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          product_id: string | null
          rating: number
        }
        Insert: {
          avatar_url?: string | null
          comment: string
          created_at?: string
          customer_name: string
          customer_role?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          product_id?: string | null
          rating: number
        }
        Update: {
          avatar_url?: string | null
          comment?: string
          created_at?: string
          customer_name?: string
          customer_role?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          product_id?: string | null
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_events: {
        Row: {
          carrier: string
          created_at: string | null
          description: string | null
          event_timestamp: string
          id: string
          location: string | null
          package_id: string
          raw_data: Json | null
          status: string
          tracking_number: string
          updated_at: string | null
        }
        Insert: {
          carrier: string
          created_at?: string | null
          description?: string | null
          event_timestamp: string
          id?: string
          location?: string | null
          package_id: string
          raw_data?: Json | null
          status: string
          tracking_number: string
          updated_at?: string | null
        }
        Update: {
          carrier?: string
          created_at?: string | null
          description?: string | null
          event_timestamp?: string
          id?: string
          location?: string | null
          package_id?: string
          raw_data?: Json | null
          status?: string
          tracking_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_events_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      traveler_affidavits: {
        Row: {
          client_address: string
          client_dni: string
          client_name: string
          created_at: string
          id: string
          signature_data: string
          signed_at: string
          traveler_dni: string
          traveler_name: string
          user_id: string
        }
        Insert: {
          client_address: string
          client_dni: string
          client_name: string
          created_at?: string
          id?: string
          signature_data: string
          signed_at?: string
          traveler_dni: string
          traveler_name: string
          user_id: string
        }
        Update: {
          client_address?: string
          client_dni?: string
          client_name?: string
          created_at?: string
          id?: string
          signature_data?: string
          signed_at?: string
          traveler_dni?: string
          traveler_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "traveler_affidavits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      traveler_trips: {
        Row: {
          accepted_at: string | null
          commission: number
          completed_at: string | null
          created_at: string
          destination: string
          id: string
          notes: string | null
          origin: string
          package_id: string
          status: string
          travel_date: string | null
          traveler_id: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          accepted_at?: string | null
          commission?: number
          completed_at?: string | null
          created_at?: string
          destination?: string
          id?: string
          notes?: string | null
          origin?: string
          package_id: string
          status?: string
          travel_date?: string | null
          traveler_id: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          accepted_at?: string | null
          commission?: number
          completed_at?: string | null
          created_at?: string
          destination?: string
          id?: string
          notes?: string | null
          origin?: string
          package_id?: string
          status?: string
          travel_date?: string | null
          traveler_id?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      warehouse_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          logged_by: string
          package_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          logged_by: string
          package_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          logged_by?: string
          package_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_logs_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          message_type: string
          package_id: string
          status: string
          timestamp: string
          tracking_number: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          message_type: string
          package_id: string
          status?: string
          timestamp?: string
          tracking_number?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string
          package_id?: string
          status?: string
          timestamp?: string
          tracking_number?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_silence_rule_to_proposal: {
        Args: { p_proposal_id: string }
        Returns: Json
      }
      approve_live_proposal: {
        Args: { p_cliente_id: string; p_proposal_id: string }
        Returns: boolean
      }
      approve_ps_quote: {
        Args: {
          p_cliente_id: string
          p_ip_address?: string
          p_quote_id: string
          p_user_agent?: string
        }
        Returns: boolean
      }
      calculate_vip_tier: { Args: { lifetime_points: number }; Returns: string }
      calculate_volumetric_weight: {
        Args: { dimensions_str: string }
        Returns: number
      }
      can_advance_ps_order_status: {
        Args: {
          p_new_status: Database["public"]["Enums"]["ps_order_status"]
          p_order_id: string
        }
        Returns: boolean
      }
      check_budget_available: {
        Args: { p_amount: number; p_live_order_id: string }
        Returns: boolean
      }
      complete_referral: {
        Args: { referral_id_param: string }
        Returns: undefined
      }
      create_guest_order: {
        Args: {
          p_customer_email: string
          p_customer_phone: string
          p_items: Json
          p_notes: string
          p_shipping_address: string
          p_shipping_city: string
          p_total_amount: number
        }
        Returns: string
      }
      create_ps_live_proposal: {
        Args: {
          p_categoria: string
          p_descripcion?: string
          p_imagen_url?: string
          p_live_order_id: string
          p_nombre_producto: string
          p_precio: number
          p_session_id: string
          p_tienda: string
        }
        Returns: Json
      }
      create_ps_notification: {
        Args: {
          p_mensaje: string
          p_metadata?: Json
          p_order_id?: string
          p_quote_id?: string
          p_request_id?: string
          p_tipo: string
          p_titulo: string
          p_user_id: string
        }
        Returns: string
      }
      end_ps_live_session: { Args: { p_session_id: string }; Returns: Json }
      expire_ps_quotes: { Args: never; Returns: undefined }
      generate_referral_code: { Args: never; Returns: string }
      get_user_points_balance: { Args: { p_user_id: string }; Returns: number }
      get_vip_discount: { Args: { tier: string }; Returns: number }
      get_vip_tier_info: {
        Args: { p_user_id: string }
        Returns: {
          discount_percentage: number
          lifetime_points: number
          next_tier: string
          points_to_next_tier: number
          tier: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      pause_ps_live_session: { Args: { p_session_id: string }; Returns: Json }
      reject_live_proposal: {
        Args: { p_cliente_id: string; p_motivo?: string; p_proposal_id: string }
        Returns: boolean
      }
      reject_ps_quote: {
        Args: {
          p_cliente_id: string
          p_ip_address?: string
          p_quote_id: string
          p_razon: string
          p_user_agent?: string
        }
        Returns: boolean
      }
      resume_ps_live_session: { Args: { p_session_id: string }; Returns: Json }
      start_ps_live_session: { Args: { p_session_id: string }; Returns: Json }
    }
    Enums: {
      package_status:
        | "prealerted"
        | "received_warehouse"
        | "ready_consolidation"
        | "consolidated"
        | "ready_international"
        | "in_transit"
        | "arrived_peru"
        | "ready_delivery"
        | "delivered"
      ps_category:
        | "moda"
        | "electronica"
        | "bebes"
        | "hogar"
        | "deportes"
        | "belleza"
        | "juguetes"
        | "otros"
      ps_live_approval_type: "automatica" | "manual_por_item"
      ps_live_order_status:
        | "borrador"
        | "pendiente_aprobacion"
        | "aprobada"
        | "en_sesion"
        | "completada"
        | "cancelada"
        | "expirada"
      ps_live_payment_method: "wallet" | "preautorizacion"
      ps_live_proposal_response:
        | "aprobada"
        | "rechazada"
        | "timeout_auto_aprobada"
        | "timeout_auto_rechazada"
        | "pendiente"
      ps_live_silence_rule: "rechazar_auto" | "aprobar_auto" | "pasar_siguiente"
      ps_live_status:
        | "programada"
        | "en_vivo"
        | "finalizada"
        | "cancelada"
        | "esperando_ps"
        | "pausada"
        | "expirada"
      ps_message_type: "texto" | "imagen" | "sistema"
      ps_order_status:
        | "solicitud_recibida"
        | "en_revision"
        | "aprobado_cliente"
        | "compra_en_proceso"
        | "producto_comprado"
        | "en_almacen_usa"
        | "en_transito"
        | "en_aduanas"
        | "en_reparto"
        | "entregado"
      ps_payment_status:
        | "pendiente"
        | "procesando"
        | "completado"
        | "fallido"
        | "reembolsado"
      ps_quote_status:
        | "pendiente"
        | "aceptada"
        | "rechazada"
        | "expirada"
        | "modificada"
      ps_request_status:
        | "recibida"
        | "en_revision"
        | "cotizada"
        | "aprobada"
        | "rechazada"
        | "cancelada"
      ps_service_type: "asistido" | "live"
      user_role:
        | "customer"
        | "warehouse"
        | "admin"
        | "b2b"
        | "traveler"
        | "shopper"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      package_status: [
        "prealerted",
        "received_warehouse",
        "ready_consolidation",
        "consolidated",
        "ready_international",
        "in_transit",
        "arrived_peru",
        "ready_delivery",
        "delivered",
      ],
      ps_category: [
        "moda",
        "electronica",
        "bebes",
        "hogar",
        "deportes",
        "belleza",
        "juguetes",
        "otros",
      ],
      ps_live_approval_type: ["automatica", "manual_por_item"],
      ps_live_order_status: [
        "borrador",
        "pendiente_aprobacion",
        "aprobada",
        "en_sesion",
        "completada",
        "cancelada",
        "expirada",
      ],
      ps_live_payment_method: ["wallet", "preautorizacion"],
      ps_live_proposal_response: [
        "aprobada",
        "rechazada",
        "timeout_auto_aprobada",
        "timeout_auto_rechazada",
        "pendiente",
      ],
      ps_live_silence_rule: [
        "rechazar_auto",
        "aprobar_auto",
        "pasar_siguiente",
      ],
      ps_live_status: [
        "programada",
        "en_vivo",
        "finalizada",
        "cancelada",
        "esperando_ps",
        "pausada",
        "expirada",
      ],
      ps_message_type: ["texto", "imagen", "sistema"],
      ps_order_status: [
        "solicitud_recibida",
        "en_revision",
        "aprobado_cliente",
        "compra_en_proceso",
        "producto_comprado",
        "en_almacen_usa",
        "en_transito",
        "en_aduanas",
        "en_reparto",
        "entregado",
      ],
      ps_payment_status: [
        "pendiente",
        "procesando",
        "completado",
        "fallido",
        "reembolsado",
      ],
      ps_quote_status: [
        "pendiente",
        "aceptada",
        "rechazada",
        "expirada",
        "modificada",
      ],
      ps_request_status: [
        "recibida",
        "en_revision",
        "cotizada",
        "aprobada",
        "rechazada",
        "cancelada",
      ],
      ps_service_type: ["asistido", "live"],
      user_role: [
        "customer",
        "warehouse",
        "admin",
        "b2b",
        "traveler",
        "shopper",
      ],
    },
  },
} as const
