export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      artist_follows: {
        Row: {
          id: string
          follower_id: string
          artist_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          artist_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          artist_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_follows_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string
          full_name: string
          line1: string
          line2: string | null
          city: string
          state: string
          postal_code: string
          country: string
          phone: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label?: string
          full_name: string
          line1: string
          line2?: string | null
          city: string
          state: string
          postal_code: string
          country?: string
          phone?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          label?: string
          full_name?: string
          line1?: string
          line2?: string | null
          city?: string
          state?: string
          postal_code?: string
          country?: string
          phone?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      artists: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          profile_id: string | null
          social_media: Json | null
          specialty: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          profile_id?: string | null
          social_media?: Json | null
          specialty?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          profile_id?: string | null
          social_media?: Json | null
          specialty?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artists_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      artworks: {
        Row: {
          artist_id: string | null
          category: string | null
          created_at: string
          description: string | null
          image_path: string | null
          images: string[] | null
          id: string
          price: number
          title: string
          updated_at: string
          slug: string | null
          status: "available" | "sold" | "reserved" | "draft" | "hidden"
          sold_at: string | null
          sold_order_id: string | null
          views_count: number
          medium: string | null
          style: string | null
          dimensions: Json | null
          orientation: string | null
          tags: string[] | null
          collection_id: string | null
          story: string | null
          creation_year: number | null
          certificate_included: boolean | null
          frame_included: boolean | null
        }
        Insert: {
          artist_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          image_path?: string | null
          images?: string[] | null
          id?: string
          price: number
          title: string
          updated_at?: string
          slug?: string | null
          status?: "available" | "sold" | "reserved" | "draft" | "hidden"
          sold_at?: string | null
          sold_order_id?: string | null
          views_count?: number
          medium?: string | null
          style?: string | null
          dimensions?: Json | null
          orientation?: string | null
          tags?: string[] | null
          collection_id?: string | null
          story?: string | null
          creation_year?: number | null
          certificate_included?: boolean | null
          frame_included?: boolean | null
        }
        Update: {
          artist_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          image_path?: string | null
          images?: string[] | null
          id?: string
          price?: number
          title?: string
          updated_at?: string
          slug?: string | null
          status?: "available" | "sold" | "reserved" | "draft" | "hidden"
          sold_at?: string | null
          sold_order_id?: string | null
          views_count?: number
          medium?: string | null
          style?: string | null
          dimensions?: Json | null
          orientation?: string | null
          tags?: string[] | null
          collection_id?: string | null
          story?: string | null
          creation_year?: number | null
          certificate_included?: boolean | null
          frame_included?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "artworks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_comments: {
        Row: {
          blog_id: string
          comment: string
          created_at: string
          email: string | null
          id: string
          name: string | null
        }
        Insert: {
          blog_id: string
          comment: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
        }
        Update: {
          blog_id?: string
          comment?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blogs"
            referencedColumns: ["id"]
          },
        ]
      }
      blogs: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          published_at: string
          Slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          published_at?: string
          Slug?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          published_at?: string
          Slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blogs_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      insights: {
        Row: {
          author_id: string | null
          category: string | null
          canonical_url: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          keywords: string[] | null
          meta_description: string | null
          meta_title: string | null
          og_image: string | null
          published_at: string | null
          schema_type: string | null
          slug: string | null
          status: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          canonical_url?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string | null
          schema_type?: string | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          canonical_url?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string | null
          schema_type?: string | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insights_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          id: string
          document_type: "artist_agreement" | "terms_conditions" | "privacy_policy" | "shipping_policy" | "return_policy"
          version: string
          content: string
          updated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          document_type: "artist_agreement" | "terms_conditions" | "privacy_policy" | "shipping_policy" | "return_policy"
          version: string
          content: string
          updated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          document_type?: "artist_agreement" | "terms_conditions" | "privacy_policy" | "shipping_policy" | "return_policy"
          version?: string
          content?: string
          updated_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          id: string
          certificate_number: string
          artwork_id: string
          order_item_id: string
          artist_id: string
          collector_id: string
          pdf_url: string | null
          qr_code: string | null
          issued_at: string | null
          verification_url: string | null
          certificate_status: "active" | "revoked" | "pending" | null
          hash: string | null
          version: string | null
          created_by: string | null
          error_message: string | null
        }
        Insert: {
          id?: string
          certificate_number: string
          artwork_id: string
          order_item_id: string
          artist_id: string
          collector_id: string
          pdf_url?: string | null
          qr_code?: string | null
          issued_at?: string | null
          verification_url?: string | null
          certificate_status?: "active" | "revoked" | "pending" | null
          hash?: string | null
          version?: string | null
          created_by?: string | null
          error_message?: string | null
        }
        Update: {
          id?: string
          certificate_number?: string
          artwork_id?: string
          order_item_id?: string
          artist_id?: string
          collector_id?: string
          pdf_url?: string | null
          qr_code?: string | null
          issued_at?: string | null
          verification_url?: string | null
          certificate_status?: "active" | "revoked" | "pending" | null
          hash?: string | null
          version?: string | null
          created_by?: string | null
          error_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_collector_id_fkey"
            columns: ["collector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      cart_items: {
        Row: {
          artwork_id: string
          created_at: string
          id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          artwork_id: string
          created_at?: string
          id?: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          artwork_id?: string
          created_at?: string
          id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
        ]
      }
      liked_items: {
        Row: {
          artwork_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          artwork_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          artwork_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "liked_items_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          read: boolean
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          read?: boolean
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          read?: boolean
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }

      order_items: {
        Row: {
          artwork_id: string
          created_at: string
          id: string
          order_id: string
          price_at_purchase: number
          quantity: number
          fulfillment_status: string
          shipping_provider: string | null
          tracking_number: string | null
          tracking_url: string | null
          shipping_notes: string | null
          accepted_at: string | null
          preparing_at: string | null
          packed_at: string | null
          shipped_at: string | null
          delivered_at: string | null
          completed_at: string | null
          cancelled_at: string | null
          payout_status: string
          payout_amount: number | null
          payout_date: string | null
        }
        Insert: {
          artwork_id: string
          created_at?: string
          id?: string
          order_id: string
          price_at_purchase: number
          quantity: number
          fulfillment_status?: string
          shipping_provider?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          shipping_notes?: string | null
          accepted_at?: string | null
          preparing_at?: string | null
          packed_at?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
          payout_status?: string
          payout_amount?: number | null
          payout_date?: string | null
        }
        Update: {
          artwork_id?: string
          created_at?: string
          id?: string
          order_id?: string
          price_at_purchase?: number
          quantity?: number
          fulfillment_status?: string
          shipping_provider?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          shipping_notes?: string | null
          accepted_at?: string | null
          preparing_at?: string | null
          packed_at?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
          payout_status?: string
          payout_amount?: number | null
          payout_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
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
          created_at: string
          id: string
          payment_intent_id: string | null
          shipping_address: Json | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string
          id?: string
          payment_intent_id?: string | null
          shipping_address?: Json | null
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address?: Json | null
          created_at?: string
          id?: string
          payment_intent_id?: string | null
          shipping_address?: Json | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone_number: string | null
          role: string | null
          updated_at: string
          verification_status: "pending" | "identity_submitted" | "under_review" | "verified" | "premium" | "featured"
          trust_score: number | null
          verified_at: string | null
          verification_notes: string | null
          agreement_accepted: boolean | null
          agreement_version: string | null
          agreement_accepted_at: string | null
          profile_views_count: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone_number?: string | null
          role?: string | null
          updated_at?: string
          verification_status?: "pending" | "identity_submitted" | "under_review" | "verified" | "premium" | "featured"
          trust_score?: number | null
          verified_at?: string | null
          verification_notes?: string | null
          agreement_accepted?: boolean | null
          agreement_version?: string | null
          agreement_accepted_at?: string | null
          profile_views_count?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone_number?: string | null
          role?: string | null
          updated_at?: string
          verification_status?: "pending" | "identity_submitted" | "under_review" | "verified" | "premium" | "featured"
          trust_score?: number | null
          verified_at?: string | null
          verification_notes?: string | null
          agreement_accepted?: boolean | null
          agreement_version?: string | null
          agreement_accepted_at?: string | null
          profile_views_count?: number
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          message: string | null
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string | null
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string | null
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_artwork_view: {
        Args: {
          p_artwork_id: string
        }
        Returns: undefined
      }
      increment_profile_view: {
        Args: {
          p_artist_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
